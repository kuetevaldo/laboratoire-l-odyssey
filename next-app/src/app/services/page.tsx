import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HeartPulse, Microscope, Stethoscope, Waves } from "lucide-react";
import { BackHome } from "@/components/BackHome";
import { ServicesCatalog } from "@/components/ServicesCatalog";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Services & Examens de Laboratoire",
  description:
    "Analyses médicales, bilans de santé, bilans spécialisés, échographie, consultation et analyses des eaux au Laboratoire L’Odyssey à Douala.",
  alternates: { canonical: "/services" },
};

const featuredServices = [
  {
    title: "Analyses médicales",
    icon: Microscope,
    text: "Des examens biologiques réalisés pour le dépistage, le diagnostic et le suivi rigoureux de votre santé.",
    items: [
      "Biochimie et hématologie",
      "Microbiologie et virologie",
      "Bilans diabétique, rénal et hépatique",
      "Bilans infectieux et hormonaux",
    ],
  },
  {
    title: "Échographie",
    icon: Waves,
    text: "Un examen d’imagerie non invasif réalisé dans un cadre confidentiel et bienveillant, avec explications claires.",
    items: [
      "Orientation selon votre prescription",
      "Accueil sur rendez-vous",
      "Accompagnement avant l’examen",
      "Compte rendu remis au patient",
    ],
  },
  {
    title: "Consultation",
    icon: Stethoscope,
    text: "Un temps d’écoute médicale pour comprendre vos besoins, évaluer vos symptômes et vous orienter avec précision.",
    items: [
      "Entretien médical",
      "Orientation diagnostique",
      "Lecture et explication des résultats",
      "Conseils de suivi personnalisés",
    ],
  },
  {
    title: "Biologie de la reproduction",
    icon: HeartPulse,
    text: "Des bilans ciblés pour accompagner la fertilité et la santé reproductive féminine et masculine avec la plus grande discrétion.",
    items: [
      "Bilan hormonal",
      "Spermogramme",
      "Bilan prénatal et prénuptial",
      "Examens de fertilité",
    ],
  },
];

export default function ServicesPage() {
  const whatsappConsultUrl =
    "https://wa.me/237695956541?text=" +
    encodeURIComponent("Bonjour Laboratoire L'Odyssey, je souhaite obtenir des renseignements sur vos services et examens.");

  return (
    <>
      <BackHome />
      <main id="main-content">
        {/* Hero Section */}
        <section className="page-hero reveal">
          <div className="container">
            <p className="eyebrow">
              <span /> Nos prestations médicales
            </p>
            <h1>Les bons examens, au bon moment.</h1>
            <p>
              Une offre médicale claire et exhaustive pour vous orienter, examiner et accompagner votre suivi en toute confidentialité à Douala.
            </p>
          </div>
        </section>

        {/* Featured 4 Care Poles */}
        <section className="page-section" aria-label="Pôles d'expertise principaux">
          <div className="container services-page-grid">
            {featuredServices.map((service) => {
              const Icon = service.icon;
              return (
                <article className="service-detail reveal" key={service.title}>
                  <div className="service-detail-copy">
                    <Icon aria-hidden="true" />
                    <h2>{service.title}</h2>
                    <p>{service.text}</p>
                    <ul>
                      {service.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Restored Complete Medical Catalog & Filter/Search */}
        <ServicesCatalog />

        {/* Call to action section */}
        <section className="services-cta" aria-label="Besoin d'aide ou de conseils">
          <div className="container">
            <div>
              <h2>Vous ne savez pas quel examen choisir ?</h2>
              <p>
                Décrivez votre situation ou votre prescription à notre équipe. Nous vous répondrons rapidement pour vous conseiller et fixer votre rendez-vous.
              </p>
            </div>
            <div className="services-cta-actions">
              <Link href="/#appointment" className="btn-light">
                Prendre rendez-vous <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={whatsappConsultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-outline"
                aria-label="Poser une question sur WhatsApp (nouvel onglet)"
              >
                <WhatsAppIcon style={{ width: 18, height: 18, fill: "currentColor" }} />
                <span>Écrire sur WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
