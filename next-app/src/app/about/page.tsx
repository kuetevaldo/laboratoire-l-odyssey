import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleCheck } from "lucide-react";
import { BackHome } from "@/components/BackHome";

export const metadata: Metadata = { title: "À propos", description: "Découvrez l’équipe, les valeurs et l’environnement du Laboratoire L’Odyssey à Douala.", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return <><BackHome /><main><section className="page-hero reveal"><div className="container"><p className="eyebrow"><span /> À propos du laboratoire</p><h1>La précision médicale, avec une attention profondément humaine.</h1><p>Nous créons un parcours rassurant où chaque patient est accueilli, informé et accompagné avec respect.</p></div></section>
    <div className="page-hero-media reveal"><Image src="/images/hero-img.jpg" alt="Accueil du Laboratoire L’Odyssey" fill priority sizes="100vw" /></div>
    <section className="page-section"><div className="container page-copy-grid"><div className="reveal"><p className="eyebrow"><span /> Notre engagement</p><h2>Des examens fiables dans un cadre pensé pour vous rassurer.</h2></div><div className="reveal"><p>Le Laboratoire L’Odyssey accompagne les patients de Douala avec des analyses médicales, des consultations et des examens d’échographie réalisés dans un environnement moderne.</p><p>Notre approche réunit exigence technique, disponibilité et confidentialité afin que vous puissiez comprendre chaque étape de votre prise en charge.</p><ul className="value-list"><li><CircleCheck /><div><strong>Clarté</strong><br />Des explications simples avant et après chaque examen.</div></li><li><CircleCheck /><div><strong>Fiabilité</strong><br />Des procédures rigoureuses et des équipements adaptés.</div></li><li><CircleCheck /><div><strong>Bienveillance</strong><br />Une équipe disponible, respectueuse et attentive.</div></li></ul></div></div>
      <div className="container secondary-gallery"><figure className="reveal"><Image src="/images/doctor-borel.jpg" alt="Professionnel de santé du laboratoire" fill sizes="50vw" /></figure><figure className="reveal"><Image src="/images/equipe.borel.jpg" alt="Équipe du Laboratoire L’Odyssey" fill sizes="50vw" /></figure></div>
    </section><section className="services-cta"><div className="container"><div><h2>Une équipe disponible tous les jours.</h2><p>Le laboratoire vous accueille du lundi au dimanche, de 07h à 20h, à Ndogbong Bifaga.</p></div><Link href="/#appointment" className="btn-light">Prendre rendez-vous <ArrowRight /></Link></div></section>
  </main></>;
}
