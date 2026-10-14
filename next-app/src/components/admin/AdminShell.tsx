"use client";

import { BarChart3, CalendarDays, FileText, LogOut, Menu, MessageSquare, Newspaper, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { href: "/admin/appointments", label: "Rendez-vous", icon: CalendarDays, count: "appointments" },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare, count: "messages" },
  { href: "/admin/results", label: "Résultats patients", icon: FileText },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
] as const;

export function AdminShell({ children, displayName, counts }: { children: React.ReactNode; displayName: string; counts: { appointments: number; messages: number } }) {
  const pathname = usePathname(); const router = useRouter(); const [open, setOpen] = useState(false);
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }
  return <div className="admin-area"><button className={`admin-overlay ${open ? "visible" : ""}`} type="button" aria-label="Fermer le menu" onClick={() => setOpen(false)} />
    <aside className={`admin-sidebar ${open ? "open" : ""}`}><Link className="admin-brand" href="/admin"><Image src="/images/logo.jpg" alt="Laboratoire L’Odyssey" width={2172} height={724} priority /></Link><p className="admin-label">Navigation</p><nav className="admin-nav" aria-label="Navigation administration">{links.slice(0, 5).map((item) => { const Icon = item.icon; const active = "exact" in item ? pathname === item.href : pathname.startsWith(item.href); const count = "count" in item ? counts[item.count] : undefined; return <Link href={item.href} className={active ? "active" : ""} key={item.href} onClick={() => setOpen(false)}><Icon /><span>{item.label}</span>{typeof count === "number" && <b>{count}</b>}</Link>; })}</nav><p className="admin-label">Compte</p><nav className="admin-nav"><Link href="/admin/settings" className={pathname.startsWith("/admin/settings") ? "active" : ""}><Settings /><span>Paramètres</span></Link><button type="button" onClick={logout}><LogOut /><span>Se déconnecter</span></button></nav><div className="admin-sidebar-foot"><ShieldCheck /><span>Données protégées</span></div></aside>
    <div className="admin-main"><header className="admin-topbar"><button className="admin-menu-button" type="button" aria-label="Ouvrir le menu" onClick={() => setOpen(true)}><Menu /></button><div className="admin-title"><small>Vue d’ensemble</small><strong>Administration</strong></div><div className="admin-top-actions"><span className="admin-date" suppressHydrationWarning><CalendarDays size={16} /> {new Intl.DateTimeFormat("fr-FR").format(new Date())}</span><span className="admin-avatar" title={displayName}>{displayName.slice(0, 1).toUpperCase()}</span><button className="admin-icon" type="button" onClick={logout} title="Déconnexion"><LogOut /></button></div></header><main className="admin-content">{children}</main></div>
  </div>;
}
