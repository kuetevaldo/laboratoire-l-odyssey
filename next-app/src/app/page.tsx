import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, Check, Clock3, FileText, HeartPulse, MapPin, Microscope, Phone, ShieldCheck, Stethoscope, UserRoundCheck, Waves } from "lucide-react";
import { AppointmentForm } from "@/components/AppointmentForm";
import { ContactForm } from "@/components/ContactForm";
import { FloatingActions } from "@/components/FloatingActions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  const organization = {
    "@context": "https://schema.org", "@type": "MedicalOrganization", name: "Laboratoire L’Odyssey",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000", telephone: "+237695956541",
    address: { "@type": "PostalAddress", streetAddress: "Ndogbong Bifaga", addressLocality: "Douala", addressCountry: "CM" },
    openingHours: "Mo-Su 07:00-20:00",
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
    <a className="skip-link" href="#main-content">Aller au contenu</a>
    <SiteHeader />
    <main id="main-content">
      <section className="hero"><div className="container hero-grid"><div className="hero-copy reveal">
        <p className="eyebrow"><span /> Laboratoire médical à Douala</p><h1>Des analyses fiables. Des soins plus sereins.</h1>
        <p className="hero-lead">Analyses, consultation et échographie, 7j/7 de 07h à 20h.</p>
        <div className="hero-actions"><Link href="#appointment" className="btn-primary">Prendre rendez-vous <ArrowRight /></Link><Link href="/results" className="text-link"><FileText /> Consulter mes résultats</Link></div>
      </div></div></section>

      <section className="trust-strip" aria-label="Informations pratiques"><div className="container trust-grid">
        <div className="trust-item"><CalendarCheck /><span><strong>Sans attente inutile</strong>Rendez-vous en ligne</span></div>
        <div className="trust-item"><Microscope /><span><strong>Analyses précises</strong>Équipements adaptés</span></div>
        <div className="trust-item"><UserRoundCheck /><span><strong>Équipe disponible</strong>Écoute et orientation</span></div>
        <Link className="trust-result-link" href="/results"><span><strong>Vos résultats</strong>Consulter ou télécharger</span><ArrowRight /></Link>
      </div></section>

      <section className="impact-stats reveal" aria-label="Chiffres clés du laboratoire"><div className="container impact-stats-grid">
        <div className="impact-stat"><strong><span className="counter" data-target="1500">0</span>+</strong><p>Patients accompagnés</p></div>
        <div className="impact-stat"><strong><span className="counter" data-target="12">0</span>+</strong><p>Années d’expérience</p></div>
        <div className="impact-stat"><strong><span className="counter" data-target="98">0</span>%</strong><p>Indice de satisfaction</p></div>
        <div className="impact-stat"><strong><span className="counter" data-target="24">0</span>h</strong><p>Délai cible pour plusieurs analyses</p></div>
      </div></section>

      <section className="section services-showcase" id="services"><div className="container">
        <div className="section-intro reveal"><div><p className="eyebrow"><span /> Nos services</p><h2>Un accompagnement médical qui va à l’essentiel.</h2></div><Link className="text-link" href="/services">Voir tous les services <ArrowRight /></Link></div>
        <div className="service-mosaic">
          <article className="service-feature service-feature-large reveal"><Image src="/images/lab-tests.jpg" alt="Analyses médicales en laboratoire" fill sizes="(max-width: 800px) 100vw, 55vw" /><div className="service-overlay"><Microscope /><h3>Analyses médicales</h3><p>Des examens biologiques pour dépister, diagnostiquer et suivre votre santé.</p><Link href="/services">Découvrir les analyses <ArrowRight /></Link></div></article>
          <article className="service-feature reveal"><Image src="/images/consultation.jpg" alt="Consultation médicale" fill sizes="(max-width: 800px) 100vw, 45vw" /><div className="service-overlay"><Stethoscope /><h3>Consultation</h3><p>Une écoute attentive et une orientation adaptée.</p><Link href="#appointment">Choisir un créneau <ArrowRight /></Link></div></article>
          <article className="service-feature reveal"><Image src="/images/ultrasound.jpg" alt="Échographie médicale" fill sizes="(max-width: 800px) 100vw, 45vw" /><div className="service-overlay"><Waves /><h3>Échographie</h3><p>Un examen non invasif dans un cadre confidentiel.</p><Link href="#appointment">Prendre rendez-vous <ArrowRight /></Link></div></article>
          <article className="service-feature reveal"><Image src="/images/biology-reproductif.jpg" alt="Biologie de la reproduction" fill sizes="(max-width: 800px) 100vw, 45vw" /><div className="service-overlay"><HeartPulse /><h3>Biologie de la reproduction</h3><p>Des bilans ciblés, réalisés avec discrétion.</p><Link href="/services">Voir le service <ArrowRight /></Link></div></article>
        </div>
      </div></section>

      <section className="section care-section"><div className="container care-grid">
        <div className="care-gallery reveal"><figure className="care-main-image"><Image src="/images/reproductive-care.jpg" alt="Santé reproductive féminine" fill sizes="(max-width: 900px) 100vw, 50vw" /></figure><figure className="care-small-image"><Image src="/images/diagnostic-2.jpg" alt="Diagnostic médical" fill sizes="280px" /></figure><div className="care-badge"><strong>Une prise en charge</strong><span>discrète et personnalisée</span></div></div>
        <div className="care-content reveal"><h2>Une équipe qui vous écoute avant de vous examiner.</h2><p>Nous accordons autant d’importance à la qualité des analyses qu’à la façon dont vous êtes accueilli et informé.</p><ul className="care-list"><li><Check /> Accueil attentif et confidentiel</li><li><Check /> Explications claires à chaque étape</li><li><Check /> Résultats accessibles en ligne</li></ul><Link className="btn-secondary" href="/about">Découvrir le laboratoire</Link></div>
      </div></section>

      <section className="results-callout reveal"><div className="container results-callout-grid"><div className="results-callout-copy"><span className="results-icon"><ShieldCheck /></span><div><h2>Vos résultats, disponibles quand vous en avez besoin.</h2><p>Accédez à vos documents avec les identifiants confidentiels remis par le laboratoire.</p></div></div><Link className="btn-light" href="/results">Accéder à mes résultats <ArrowRight /></Link></div></section>

      <section className="section video-section"><div className="container"><div className="section-intro reveal"><div><h2>Entrez dans notre quotidien.</h2></div></div><div className="video-grid"><article className="video-card reveal"><video controls preload="metadata" playsInline><source src="/video/video1.mp4" type="video/mp4" /></video><div><span>Le laboratoire</span><h3>Découvrez notre environnement</h3><p>Un cadre organisé pour accueillir chaque patient avec attention.</p></div></article><article className="video-card reveal"><video controls preload="metadata" playsInline><source src="/video/video2.mp4" type="video/mp4" /></video><div><span>Notre méthode</span><h3>Nos équipes en action</h3><p>Des gestes précis et une prise en charge confidentielle.</p></div></article></div></div></section>

      <section className="section appointment" id="appointment"><div className="container appointment-layout"><div className="appointment-copy reveal"><p className="eyebrow"><span /> Rendez-vous</p><h2>Choisissez le moment qui vous convient.</h2><p>Envoyez votre demande. Notre équipe vous rappelle pour confirmer le créneau.</p><div className="appointment-contact"><Phone /><div><small>Besoin d’aide ?</small><a href="tel:+237695956541">+237 695 956 541</a></div></div><ul><li><Check /> Réponse rapide de notre équipe</li><li><Check /> Créneaux de 07h à 20h</li><li><Check /> Ouvert tous les jours</li></ul></div><AppointmentForm /></div></section>

      <section className="section contact" id="contact"><div className="container contact-layout"><div className="contact-panel reveal"><h2>Une question avant votre visite ?</h2><p>Écrivez-nous ou appelez directement le laboratoire.</p><div className="contact-details"><a href="tel:+237695956541"><Phone /><span><small>Téléphone</small><strong>+237 695 956 541</strong></span></a><div><Clock3 /><span><small>Horaires</small><strong>07h - 20h, 7j/7</strong></span></div><div><MapPin /><span><small>Adresse</small><strong>Ndogbong Bifaga, Douala</strong></span></div></div></div><ContactForm /></div></section>

      <section className="location-section"><div className="container location-card reveal"><div className="location-heading"><div><h2>Facile à trouver, simple d’accès.</h2></div><a className="btn-secondary" href="https://www.google.com/maps/search/?api=1&query=Laboratoire%20L%27Odyssey%20Douala" target="_blank" rel="noopener"><MapPin /> Obtenir l’itinéraire</a></div><div className="location-placeholder"><MapPin /><strong>Ndogbong Bifaga, Douala</strong><span>Ouvrir l’itinéraire pour nous rejoindre.</span></div></div></section>
    </main>
    <SiteFooter /><FloatingActions />
  </>;
}
