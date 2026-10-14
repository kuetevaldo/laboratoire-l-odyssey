"use client";

import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setPending(true);
    try { const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); const result = await response.json(); if (!response.ok) throw new Error(result.message); router.replace("/admin"); router.refresh(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Connexion impossible."); }
    finally { setPending(false); }
  }
  return <form className="admin-form admin-login-form" onSubmit={submit}><label>Identifiant<input name="username" required autoFocus autoComplete="username" minLength={3} maxLength={50} /></label><label>Mot de passe<input type="password" name="password" required autoComplete="current-password" minLength={8} /></label>{error && <p className="admin-feedback error" role="alert">{error}</p>}<button className="admin-primary" type="submit" disabled={pending}>{pending ? "Connexion…" : "Accéder au tableau de bord"} <LogIn /></button></form>;
}
