import { Phone } from "lucide-react";

export function FloatingActions() {
  return (
    <a href="tel:+237695956541" className="mobile-call-action" aria-label="Appeler le Laboratoire L'Odyssey">
      <span>
        <Phone />
      </span>
      <strong>Appelez-nous</strong>
      <small>Ouvert jusqu’à 20h</small>
    </a>
  );
}
