"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="error-page">
      <section>
        <p className="eyebrow"><span /> Service temporairement indisponible</p>
        <h1>Cette page ne peut pas être affichée pour le moment.</h1>
        <p>Réessayez dans un instant. Vous pouvez aussi revenir à l’accueil ou appeler directement le laboratoire.</p>
        <div className="error-actions">
          <button className="btn-primary" type="button" onClick={reset}><RotateCcw /> Réessayer</button>
          <Link className="btn-secondary" href="/">Retour à l’accueil</Link>
        </div>
      </section>
    </main>
  );
}
