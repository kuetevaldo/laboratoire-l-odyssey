import type { Metadata } from "next";
import { BackHome } from "@/components/BackHome";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Informations sur la protection des données personnelles des patients et visiteurs du Laboratoire L’Odyssey.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <BackHome />
      <main className="legal-page">
        <article className="container legal-document">
          <header>
            <p className="eyebrow"><span /> Vos données</p>
            <h1>Politique de confidentialité</h1>
            <p>Cette page explique simplement comment les informations transmises sur ce site sont utilisées et protégées.</p>
          </header>

          <section>
            <h2>Informations collectées</h2>
            <p>Nous collectons uniquement les informations nécessaires pour répondre à vos demandes de rendez-vous, traiter vos messages et vous donner accès à vos résultats.</p>
          </section>

          <section>
            <h2>Utilisation des données</h2>
            <p>Vos informations servent à organiser votre prise en charge, vous recontacter et assurer le suivi administratif de votre dossier. Elles ne sont ni vendues ni utilisées à des fins publicitaires.</p>
          </section>

          <section>
            <h2>Résultats patients</h2>
            <p>Les résultats sont conservés dans un espace privé. Leur consultation nécessite un numéro patient et un code confidentiel. Les liens directs vers les documents ne sont pas publics.</p>
          </section>

          <section>
            <h2>Durée de conservation</h2>
            <p>Les données sont conservées pendant la durée nécessaire au traitement de la demande et selon les obligations applicables aux documents médicaux et administratifs.</p>
          </section>

          <section>
            <h2>Vos demandes</h2>
            <p>Pour demander l’accès, la correction ou la suppression d’une information, contactez le laboratoire au <a href="tel:+237695956541">+237 695 956 541</a> ou utilisez le formulaire de contact.</p>
          </section>

          <p className="legal-updated">Dernière mise à jour : octobre 2026</p>
        </article>
      </main>
    </>
  );
}
