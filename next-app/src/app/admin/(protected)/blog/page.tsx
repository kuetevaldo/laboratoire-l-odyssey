import { desc } from "drizzle-orm";
import { BlogManager, type BlogRow } from "@/components/admin/BlogManager";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";

export default async function AdminBlogPage() {
  const rows = await getDb().select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  const posts: BlogRow[] = rows.map((row) => ({ id: row.id, title: row.title, excerpt: row.excerpt, content: row.content, slug: row.slug, isPublished: row.isPublished, publishedAt: row.publishedAt?.toISOString() ?? null, createdAt: row.createdAt.toISOString() }));
  return <><section className="admin-welcome"><div><h1>Blog du laboratoire</h1><p>Partagez vos articles, partenariats et événements.</p></div></section><BlogManager posts={posts} /></>;
}
