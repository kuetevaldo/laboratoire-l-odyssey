import { LockKeyhole, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link className="brand" href="/"><Image src="/images/logo.jpg" alt="Laboratoire L’Odyssey" width={2172} height={724} /></Link>
          <p>Des analyses fiables, un accueil humain et des résultats accessibles en toute confidentialité.</p>
          <div className="footer-socials"><a href="https://wa.me/237695956541" target="_blank" rel="noopener" aria-label="Écrire au laboratoire sur WhatsApp"><MessageCircle /></a></div>
        </div>
        <div className="footer-column"><h3>Navigation</h3><Link href="/services">Services</Link><Link href="/results">Résultats patients</Link><Link href="/about">À propos</Link><Link href="/blog">Blog</Link></div>
        <div className="footer-column"><h3>Informations</h3><Link href="/#appointment">Prendre rendez-vous</Link><Link href="/#contact">Écrivez-nous via le formulaire</Link><a href="tel:+237695956541">+237 695 956 541</a><span>Ouvert 7j/7, 07h - 20h</span><Link className="footer-admin-link" href="/admin/login"><LockKeyhole size={15} /> Administration</Link></div>
      </div>
      <div className="container footer-bottom"><p>© {new Date().getFullYear()} Laboratoire L’Odyssey. Tous droits réservés.</p><nav aria-label="Informations légales"><Link href="/privacy">Confidentialité</Link><Link href="/legal">Mentions légales</Link><span>Ndogbong Bifaga, Douala</span></nav></div>
    </footer>
  );
}
