import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BackHome } from "@/components/BackHome";
import { ServicesCatalog } from "@/components/ServicesCatalog";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Services & Examens de Laboratoire",
  description:
    "Analyses médicales, bilans de santé, bilans spécialisés, échographie, consultation et analyses des eaux au Laboratoire L'Odyssey à Douala.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  const whatsappConsultUrl =
    "https://wa.me/237695956541?text=" +
    encodeURIComponent("Bonjour Laboratoire L'Odyssey, je souhaite obtenir des renseignements sur vos services et examens.");

  return (
    <>
      <BackHome />
      <main id="main-content">
        {/* Complete Medical Catalog & Filter/Search */}
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
