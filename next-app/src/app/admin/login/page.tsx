import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");
  return <main className="admin-login"><section className="admin-login-card"><Image className="admin-login-logo" src="/images/logo.jpg" alt="Laboratoire L’Odyssey" width={2172} height={724} priority /><p className="admin-kicker">Laboratoire L’Odyssey</p><h1>Administration</h1><p className="admin-login-intro">Connectez-vous pour gérer les rendez-vous, messages, articles et résultats patients.</p><AdminLoginForm /><p className="admin-login-back"><Link href="/">← Retour au site</Link></p></section></main>;
}
