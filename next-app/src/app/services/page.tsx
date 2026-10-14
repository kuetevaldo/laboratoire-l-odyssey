import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HeartPulse, Microscope, Stethoscope, Waves } from "lucide-react";
import { BackHome } from "@/components/BackHome";

export const metadata: Metadata = { title: "Services", description: "Analyses médicales, consultation, échographie et biologie de la reproduction à Douala.", alternates: { canonical: "/services" } };

const services = [
  { title: "Analyses médicales", image: "/images/lab-tests.jpg", icon: Microscope, text: "Des examens biologiques réalisés pour le dépistage, le diagnostic et le suivi de votre santé.", items: ["Biochimie et hématologie", "Microbiologie et virologie", "Bilans diabétique, rénal et hépatique", "Bilans infectieux et hormonaux"] },
  { title: "Échographie", image: "/images/ultrasound.jpg", icon: Waves, text: "Un examen d’imagerie non invasif réalisé dans un cadre confidentiel, avec des explications claires.", items: ["Orientation selon votre prescription", "Accueil sur rendez-vous", "Accompagnement avant l’examen", "Compte rendu remis au patient"] },
  { title: "Consultation", image: "/images/consultation.jpg", icon: Stethoscope, text: "Un temps d’écoute pour comprendre votre besoin, évaluer vos symptômes et vous orienter.", items: ["Entretien médical", "Orientation diagnostique", "Lecture et explication des résultats", "Conseils de suivi"] },
  { title: "Biologie de la reproduction", image: "/images/biology-reproductif.jpg", icon: HeartPulse, text: "Des bilans ciblés pour accompagner la santé reproductive féminine et masculine avec discrétion.", items: ["Bilan hormonal", "Spermogramme", "Bilan prénatal et prénuptial", "Examens de fertilité"] },
];

export default function ServicesPage() {
  return <><BackHome /><main><section className="page-hero reveal"><div className="container"><p className="eyebrow"><span /> Nos services</p><h1>Les bons examens, au bon moment.</h1><p>Une offre médicale claire pour vous orienter, examiner et accompagner votre suivi en toute confidentialité.</p></div></section>
    <section className="page-section"><div className="container services-page-grid">{services.map((service) => { const Icon = service.icon; return <article className="service-detail reveal" key={service.title}><div className="service-detail-media"><Image src={service.image} alt={service.title} fill sizes="(max-width: 800px) 100vw, 50vw" /></div><div className="service-detail-copy"><Icon /><h2>{service.title}</h2><p>{service.text}</p><ul>{service.items.map((item) => <li key={item}>{item}</li>)}</ul></div></article>; })}</div></section>
    <section className="services-cta"><div className="container"><div><h2>Vous ne savez pas quel service choisir ?</h2><p>Décrivez votre besoin à notre équipe. Nous vous aiderons à préparer votre visite.</p></div><Link href="/#appointment" className="btn-light">Demander un rendez-vous <ArrowRight /></Link></div></section>
  </main></>;
}
