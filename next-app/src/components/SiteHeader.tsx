"use client";

import Image from "next/image";
import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  ["/", "Accueil"], ["/services", "Services"], ["/results", "Résultats"],
  ["/about", "À propos"], ["/blog", "Blog"], ["/#contact", "Contact"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("menu-open");
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <header className="header" id="siteHeader">
      <nav className="navbar container" aria-label="Navigation principale">
        <Link className="brand" href="/" aria-label="Laboratoire L’Odyssey, accueil">
          <Image src="/images/logo.jpg" alt="Laboratoire L’Odyssey" width={2172} height={724} priority sizes="(max-width: 760px) 154px, 210px" />
        </Link>
        <ul className={`nav-links ${open ? "open" : ""}`} id="navLinks">
          <li className="mobile-menu-brand">
            <Image src="/images/logo.jpg" alt="Laboratoire L’Odyssey" width={2172} height={724} sizes="210px" />
          </li>
          {links.map(([href, label]) => (
            <li key={href}><Link className={pathname === href || (href !== "/" && pathname.startsWith(href)) ? "active" : ""} href={href} onClick={() => setOpen(false)}>{label}</Link></li>
          ))}
          <li className="mobile-nav-call"><a href="tel:+237695956541"><Phone size={16} /> Appeler maintenant</a></li>
        </ul>
        <div className="nav-right">
          <a href="tel:+237695956541" className="nav-call"><span className="nav-call-icon"><Phone size={17} /></span><span><small>Appelez-nous</small><strong>+237 695 956 541</strong></span></a>
          <button className="menu-toggle" type="button" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-controls="navLinks" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      <button className={`nav-scrim ${open ? "visible" : ""}`} type="button" aria-label="Fermer le menu" onClick={() => setOpen(false)} />
    </header>
  );
}
