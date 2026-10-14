"use client";

import { ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";

export function AppointmentForm() {
  const [status, setStatus] = useState<{ kind: string; message: string }>({ kind: "", message: "" });
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setStatus({ kind: "", message: "" });
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      form.reset(); setStatus({ kind: "success", message: result.message });
    } catch (error) { setStatus({ kind: "error", message: error instanceof Error ? error.message : "Envoi impossible." }); }
    finally { setPending(false); }
  }
  return <form className="contact-form appointment-form reveal" onSubmit={submit}>
    <div className="form-heading"><span>Demande de rendez-vous</span><p>Tous les champs marqués * sont obligatoires.</p></div>
    <div className="form-grid">
      <label>Nom complet *<input name="name" type="text" autoComplete="name" maxLength={100} required /></label>
      <label>Téléphone *<input name="phone" type="tel" autoComplete="tel" maxLength={30} required /></label>
      <label>E-mail<input name="email" type="email" autoComplete="email" maxLength={150} /></label>
      <label>Service *<select name="service" required defaultValue=""><option value="" disabled>Choisir un service</option><option>Consultation</option><option>Bilan de santé</option><option>Échographie</option><option>Prélèvement à domicile</option></select></label>
      <label>Date *<input name="appointmentDate" type="date" min={new Date().toISOString().slice(0, 10)} required /></label>
      <label>Heure *<input name="appointmentTime" type="time" min="07:00" max="20:00" required /></label>
      <label className="form-field-full">Précisions<textarea name="notes" placeholder="Ajoutez une information utile pour notre équipe" rows={4} maxLength={1000} /></label>
    </div>
    <input type="text" name="website" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <p className={`contact-feedback ${status.kind}`} aria-live="polite">{status.message}</p>
    <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Envoi…" : "Envoyer ma demande"} <ArrowRight /></button>
  </form>;
}
