import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { deleteObject } from "@/lib/storage";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await getAdminSessionFromRequest(request))) return apiError("Session expirée.", 401);
    const id = Number((await context.params).id);
    if (!Number.isInteger(id)) return apiError("Article invalide.");
    const post = await getDb().query.blogPosts.findFirst({ where: eq(blogPosts.id, id) });
    if (!post) return apiError("Article introuvable.", 404);
    await getDb().delete(blogPosts).where(eq(blogPosts.id, id));
    if (post.coverObjectKey) await deleteObject(post.coverObjectKey).catch(() => undefined);
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return apiSuccess({ message: "Article supprimé." });
  } catch (error) {
    return apiError(readableError(error, "Impossible de supprimer cet article."));
  }
}
