import type { Metadata } from "next";
import { BackHome } from "@/components/BackHome";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site du Laboratoire L’Odyssey à Douala.",
  alternates: { canonical: "/legal" },
};

export default function LegalPage() {
  return (
    <>
      <BackHome />
      <main className="legal-page">
        <article className="container legal-document">
          <header>
            <p className="eyebrow"><span /> Informations du site</p>
            <h1>Mentions légales</h1>
            <p>Informations relatives à l’éditeur et aux conditions d’utilisation du site.</p>
          </header>

          <section>
            <h2>Éditeur</h2>
            <p>Laboratoire L’Odyssey, laboratoire d’analyses médicales situé à Ndogbong Bifaga, Douala, Cameroun.</p>
            <p>Téléphone : <a href="tel:+237695956541">+237 695 956 541</a></p>
          </section>

          <section>
            <h2>Contenu médical</h2>
            <p>Les informations publiées sur ce site sont fournies à titre informatif. Elles ne remplacent pas une consultation, un diagnostic ou une prescription médicale.</p>
          </section>

          <section>
            <h2>Responsabilité</h2>
            <p>Le laboratoire veille à maintenir des informations exactes et accessibles. Une indisponibilité temporaire du site ne doit pas retarder une demande médicale urgente.</p>
          </section>

          <section>
            <h2>Propriété intellectuelle</h2>
            <p>Les textes, photographies, éléments graphiques et signes distinctifs de ce site ne peuvent pas être réutilisés sans autorisation préalable.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>Pour toute question concernant le site, appelez le laboratoire ou utilisez le formulaire disponible sur la page d’accueil.</p>
          </section>

          <p className="legal-updated">Dernière mise à jour : octobre 2026</p>
        </article>
      </main>
    </>
  );
}
