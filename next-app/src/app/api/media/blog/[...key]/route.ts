import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";
import { apiError } from "@/lib/api";
import { getObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ key: string[] }> }) {
  const key = (await context.params).key.join("/");
  const post = await getDb().query.blogPosts.findFirst({ where: and(eq(blogPosts.coverObjectKey, key), eq(blogPosts.isPublished, true)) });
  if (!post) return apiError("Image introuvable.", 404);
  const object = await getObject(key);
  if (!object) return apiError("Image introuvable.", 404);
  const body = object.bytes.buffer.slice(object.bytes.byteOffset, object.bytes.byteOffset + object.bytes.byteLength) as ArrayBuffer;
  return new Response(body, {
    headers: {
      "Content-Type": object.contentType,
      "Content-Length": String(object.contentLength),
      "Cache-Control": "public, max-age=3600, s-maxage=86400, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
