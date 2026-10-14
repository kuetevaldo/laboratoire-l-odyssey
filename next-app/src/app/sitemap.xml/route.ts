import { and, eq, lte } from "drizzle-orm";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  let articleEntries = "";
  try {
    const posts = await getDb().select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt }).from(blogPosts).where(and(eq(blogPosts.isPublished, true), lte(blogPosts.publishedAt, new Date())));
    articleEntries = posts.map((post) => `<url><loc>${base}/blog/${encodeURIComponent(post.slug)}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod></url>`).join("");
  } catch { articleEntries = ""; }
  const pages = ["", "/services", "/about", "/results", "/blog", "/privacy", "/legal"].map((pathname) => `<url><loc>${base}${pathname || "/"}</loc></url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages}${articleEntries}</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=3600" } });
}
