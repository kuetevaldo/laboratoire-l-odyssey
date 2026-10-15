"use client";

import { Edit3, ExternalLink, Newspaper, Trash2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { readApiResponse } from "@/lib/client-api";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL, uploadSizeError } from "@/lib/upload-limits";

export type BlogRow = {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
};

const empty: BlogRow = {
  id: 0,
  title: "",
  excerpt: "",
  content: "",
  slug: "",
  isPublished: false,
  publishedAt: null,
  createdAt: "",
};

export function BlogManager({ posts }: { posts: BlogRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<BlogRow>(empty);
  const [feedback, setFeedback] = useState<{ kind: string; message: string }>({ kind: "", message: "" });
  const [pending, setPending] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback({ kind: "", message: "" });

    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("id", String(editing.id));
    data.set("isPublished", String((form.elements.namedItem("isPublished") as HTMLInputElement).checked));

    try {
      const cover = data.get("cover");
      if (cover instanceof File && cover.size > MAX_UPLOAD_BYTES) {
        throw new Error(uploadSizeError());
      }

      const response = await fetch("/api/admin/blog", { method: "POST", body: data });
      const result = await readApiResponse(response, "Impossible d’enregistrer cet article.");

      setFeedback({ kind: "success", message: result.message || "Article enregistré avec succès." });
      setEditing(empty);
      form.reset();
      router.refresh();
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "Enregistrement impossible.",
      });
    } finally {
      setPending(false);
    }
  }

  async function remove(post: BlogRow) {
    if (!confirm(`Supprimer définitivement l’article « ${post.title} » ?`)) return;

    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
      if (response.ok) {
        if (editing.id === post.id) setEditing(empty);
        router.refresh();
      } else {
        const result = await readApiResponse(response, "Impossible de supprimer cet article.");
        setFeedback({ kind: "error", message: result.message || "Erreur de suppression." });
      }
    } catch (error) {
      setFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : "Erreur lors de la suppression.",
      });
    }
  }

  return (
    <>
      {/* Blog Post Editor Panel */}
      <section className="admin-panel" aria-label="Édition d'article">
        <div className="admin-panel-head">
          <div>
            <p className="admin-kicker">Édition</p>
            <h2>{editing.id ? "Modifier l’article" : "Nouvel article"}</h2>
          </div>
          <Newspaper size={24} className="admin-panel-icon" aria-hidden="true" />
        </div>

        {feedback.message && (
          <p className={`admin-feedback ${feedback.kind}`} role="alert">
            {feedback.message}
          </p>
        )}

        <form className="admin-form" onSubmit={save} key={editing.id}>
          <label className="wide">
            Titre de l’article
            <input
              name="title"
              type="text"
              maxLength={180}
              minLength={3}
              required
              defaultValue={editing.title}
              placeholder="Ex: Campagne de dépistage et de sensibilisation..."
            />
          </label>

          <label className="wide">
            Résumé court (accroche)
            <textarea
              name="excerpt"
              rows={3}
              maxLength={300}
              minLength={10}
              required
              defaultValue={editing.excerpt}
              placeholder="Courte introduction qui apparaîtra sur la carte de l'article..."
            />
          </label>

          <label className="wide">
            Contenu complet de l’article
            <textarea
              name="content"
              rows={10}
              minLength={20}
              maxLength={50000}
              required
              defaultValue={editing.content}
              placeholder="Rédigez le corps de votre article médical ou événement..."
            />
          </label>

          <label className="wide">
            Image de couverture <small>Formats supportés : JPG, PNG ou WebP (max {MAX_UPLOAD_LABEL})</small>
            <input name="cover" type="file" accept="image/jpeg,image/png,image/webp" />
          </label>

          <div className="wide">
            <label className="admin-checkbox">
              <span>
                <input name="isPublished" type="checkbox" defaultChecked={editing.isPublished} />
                Publier immédiatement sur le blog public
              </span>
            </label>
          </div>

          <div className="admin-form-actions">
            <button className="admin-primary" type="submit" disabled={pending}>
              {pending ? "Enregistrement…" : editing.id ? "Enregistrer les modifications" : "Créer l’article"}
            </button>
            {editing.id > 0 && (
              <button className="admin-secondary" type="button" onClick={() => setEditing(empty)}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Published / Draft Articles List Panel */}
      <section className="admin-panel" aria-label="Liste des articles">
        <div className="admin-panel-head">
          <div>
            <p className="admin-kicker">Contenu</p>
            <h2>Articles du blog ({posts.length})</h2>
          </div>
          <Link className="admin-secondary" href="/blog" target="_blank" rel="noopener noreferrer">
            Voir le blog public <ExternalLink size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="admin-records">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article className="admin-record" key={post.id}>
                <div className="admin-record-body">
                  <h3>
                    <span className="admin-record-title">{post.title}</span>
                    <span className={`admin-status ${post.isPublished ? "published" : "draft"}`}>
                      {post.isPublished ? "Publié" : "Brouillon"}
                    </span>
                  </h3>
                  <p className="admin-record-excerpt">{post.excerpt}</p>
                  <time className="admin-record-date">
                    Publié le{" "}
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(
                      new Date(post.publishedAt || post.createdAt)
                    )}
                  </time>
                </div>
                <div className="admin-record-actions">
                  <button
                    className="admin-secondary"
                    type="button"
                    onClick={() => {
                      setEditing(post);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    aria-label={`Modifier l'article ${post.title}`}
                  >
                    <Edit3 size={15} aria-hidden="true" /> Modifier
                  </button>
                  <button
                    className="admin-danger"
                    type="button"
                    onClick={() => remove(post)}
                    aria-label={`Supprimer l'article ${post.title}`}
                  >
                    <Trash2 size={15} aria-hidden="true" /> Supprimer
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="admin-empty">
              <Newspaper size={36} aria-hidden="true" />
              <strong>Aucun article pour le moment.</strong>
              <span>Créez votre première actualité via le formulaire ci-dessus.</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
