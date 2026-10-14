import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><p className="eyebrow"><span /> Erreur 404</p><h1>Cette page est introuvable.</h1><p>Le contenu recherché a peut-être été déplacé.</p><Link className="btn-primary" href="/">Retour à l’accueil</Link></main>;
}
