"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const WHATSAPP_PHONE = "237695956541";
const DEFAULT_MESSAGE = "Bonjour Laboratoire L'Odyssey, je souhaite obtenir des renseignements sur vos services et examens.";

export interface WhatsAppCTAProps {
  phoneNumber?: string;
  defaultMessage?: string;
  className?: string;
}

export function WhatsAppCTA({
  phoneNumber = WHATSAPP_PHONE,
  defaultMessage = DEFAULT_MESSAGE,
  className = "",
}: WhatsAppCTAProps) {
  const pathname = usePathname();

  // Hide the floating CTA on administrative screens and sensitive patient report views
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/results/files")) {
    return null;
  }

  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <aside aria-label="Assistance WhatsApp">
      <a
        href={whatsappUrl}
        className={`whatsapp-float ${className}`.trim()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter le Laboratoire L'Odyssey sur WhatsApp (s'ouvre dans un nouvel onglet)"
      >
        <WhatsAppIcon className="whatsapp-icon" />
        <span className="whatsapp-tooltip" aria-hidden="true">
          Discuter sur WhatsApp
        </span>
      </a>
    </aside>
  );
}

export default WhatsAppCTA;
