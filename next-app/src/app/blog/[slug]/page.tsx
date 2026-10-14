import type { Metadata } from "next";
import { and, eq, lte } from "drizzle-orm";
import { cache } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BackHome } from "@/components/BackHome";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";

export const dynamic = "force-dynamic";

const getPost = cache(async (slug: string) => getDb().query.blogPosts.findFirst({ where: and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true), lte(blogPosts.publishedAt, new Date())) }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Article introuvable", robots: { index: false } };
  const image = post.coverObjectKey ? `/api/media/blog/${post.coverObjectKey}` : "/images/hero-img.jpg";
  return { title: post.title, description: post.excerpt, alternates: { canonical: `/blog/${post.slug}` }, openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.publishedAt?.toISOString(), images: [image] } };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  return <main className="article-page container"><BackHome href="/blog" label="Retour au blog" /><article className="article-content"><time dateTime={post.publishedAt?.toISOString()}>{post.publishedAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(post.publishedAt) : ""}</time><h1>{post.title}</h1><p className="article-excerpt">{post.excerpt}</p>{post.coverObjectKey && <Image className="article-cover" src={`/api/media/blog/${post.coverObjectKey}`} alt={`Illustration de l’article ${post.title}`} width={1200} height={720} priority unoptimized />}<div className="article-body">{post.content.split(/\r?\n/).map((paragraph, index) => paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />)}</div></article></main>;
}
