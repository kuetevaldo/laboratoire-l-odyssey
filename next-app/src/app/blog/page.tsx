import type { Metadata } from "next";
import { and, desc, eq, lte } from "drizzle-orm";
import { ArrowRight, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BackHome } from "@/components/BackHome";
import { getDb } from "@/db";
import { blogPosts } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blog",
  description: "Actualités, événements, partenariats et conseils du Laboratoire L’Odyssey.",
  alternates: { canonical: "/blog" },
};

async function getPublishedPosts() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  return getDb()
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.isPublished, true), lte(blogPosts.publishedAt, new Date())))
    .orderBy(desc(blogPosts.publishedAt));
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <BackHome />
      <main className="blog-public-page">
        <header className="blog-hero reveal">
          <span className="section-badge">Le journal du laboratoire</span>
          <h1>Actualités, prévention et vie du laboratoire.</h1>
          <p>Retrouvez nos campagnes, partenariats, événements et informations utiles pour mieux préparer votre parcours de santé.</p>
        </header>

        <section className="blog-list container" aria-label="Articles publiés">
          {!posts.length && (
            <div className="blog-empty">
              <Newspaper />
              <h2>Bientôt de nouveaux articles</h2>
              <p>Les publications du laboratoire apparaîtront ici.</p>
            </div>
          )}

          {posts.map((post, index) => (
            <article className={`public-blog-card reveal ${index === 0 ? "featured" : ""}`} key={post.id}>
              {post.coverObjectKey ? (
                <Image
                  src={`/api/media/blog/${post.coverObjectKey}`}
                  alt={`Illustration de l’article ${post.title}`}
                  width={1200}
                  height={760}
                  sizes={index === 0 ? "(max-width: 760px) 100vw, 65vw" : "(max-width: 760px) 100vw, 50vw"}
                  unoptimized
                />
              ) : (
                <div className="public-blog-card-placeholder"><Newspaper /></div>
              )}
              <div className="public-blog-card-content">
                {index === 0 && <span className="article-label">À la une</span>}
                <time dateTime={post.publishedAt?.toISOString()}>
                  {post.publishedAt ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(post.publishedAt) : ""}
                </time>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <Link className="btn-secondary" href={`/blog/${post.slug}`}>Lire l’article <ArrowRight /></Link>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="blog-public-footer">
        <p>© {new Date().getFullYear()} Laboratoire L’Odyssey.</p>
        <nav aria-label="Liens du blog"><Link href="/privacy">Confidentialité</Link><Link href="/">Retour au site</Link></nav>
      </footer>
    </>
  );
}
