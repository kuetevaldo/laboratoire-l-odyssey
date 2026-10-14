"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PatientAccessForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch("/api/patient-results/access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      router.push("/results/files"); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Accès impossible."); }
    finally { setPending(false); }
  }
  return <section className="results-card reveal" aria-labelledby="result-login-title">
    <div className="results-card-header"><LockKeyhole /><h2 id="result-login-title">Accéder à mes résultats</h2></div>
    <form className="results-form" onSubmit={submit}>
      <label>Numéro patient<input type="text" name="patientNumber" placeholder="Ex. ODY-000123" maxLength={50} autoComplete="username" required /></label>
      <label>Code confidentiel<input type="password" name="accessCode" placeholder="Votre code sécurisé" autoComplete="current-password" required /></label>
      {message && <p className="contact-feedback error" role="alert">{message}</p>}
      <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Vérification…" : "Consulter mes résultats"} <ArrowRight /></button>
    </form>
    <p className="results-security"><LockKeyhole /><span>Vos informations sont confidentielles. Ne partagez jamais votre code d’accès.</span></p>
  </section>;
}
