import { MessageCircle, Phone } from "lucide-react";

export function FloatingActions() {
  return <><a href="https://wa.me/237695956541" className="whatsapp-float" target="_blank" rel="noopener" aria-label="Nous contacter sur WhatsApp"><MessageCircle /></a><a href="tel:+237695956541" className="mobile-call-action"><span><Phone /></span><strong>Appelez-nous</strong><small>Ouvert jusqu’à 20h</small></a></>;
}
