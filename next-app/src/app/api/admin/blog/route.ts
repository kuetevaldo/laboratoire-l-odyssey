import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { blogImageKey, readImage } from "@/lib/files";
import { assertSameOrigin } from "@/lib/security";
import { createSlug } from "@/lib/slug";
import { deleteObject, putObject } from "@/lib/storage";
import { blogSchema } from "@/lib/validators";

async function availableSlug(title: string, currentId = 0): Promise<string> {
  const base = createSlug(title);
  for (let suffix = 0; suffix < 100; suffix += 1) {
    const slug = suffix ? `${base.slice(0, 190 - String(suffix).length)}-${suffix + 1}` : base;
    const where = currentId ? and(eq(blogPosts.slug, slug), ne(blogPosts.id, currentId)) : eq(blogPosts.slug, slug);
    if (!(await getDb().query.blogPosts.findFirst({ where }))) return slug;
  }
  return `${base.slice(0, 165)}-${Date.now()}`;
}

export async function POST(request: NextRequest) {
  let newKey = "";
  try {
    assertSameOrigin(request);
    if (!(await getAdminSessionFromRequest(request))) return apiError("Session expirée.", 401);
    const data = await request.formData();
    const input = blogSchema.parse({
      id: data.get("id") || 0,
      title: data.get("title"),
      excerpt: data.get("excerpt"),
      content: data.get("content"),
      isPublished: data.get("isPublished") === "true",
    });
    const oldPost = input.id ? await getDb().query.blogPosts.findFirst({ where: eq(blogPosts.id, input.id) }) : null;
    if (input.id && !oldPost) return apiError("Article introuvable.", 404);
    const file = data.get("cover");
    let coverObjectKey = oldPost?.coverObjectKey ?? null;
    if (file instanceof File && file.size > 0) {
      const image = await readImage(file);
      newKey = blogImageKey(image.extension);
      await putObject(newKey, image.bytes, file.type);
      coverObjectKey = newKey;
    }
    const now = new Date();
    const values = {
      title: input.title,
      slug: await availableSlug(input.title, input.id),
      excerpt: input.excerpt,
      content: input.content,
      coverObjectKey,
      isPublished: input.isPublished,
      publishedAt: input.isPublished ? oldPost?.publishedAt ?? now : null,
      updatedAt: now,
    };
    if (oldPost) {
      await getDb().update(blogPosts).set(values).where(eq(blogPosts.id, oldPost.id));
    } else {
      await getDb().insert(blogPosts).values(values);
    }
    if (newKey && oldPost?.coverObjectKey) await deleteObject(oldPost.coverObjectKey).catch(() => undefined);
    revalidatePath("/blog");
    if (oldPost?.slug) revalidatePath(`/blog/${oldPost.slug}`);
    return apiSuccess({ message: input.isPublished ? "Article publié." : "Brouillon enregistré." }, oldPost ? 200 : 201);
  } catch (error) {
    if (newKey) await deleteObject(newKey).catch(() => undefined);
    return apiError(readableError(error, "Impossible d’enregistrer cet article."));
  }
}
