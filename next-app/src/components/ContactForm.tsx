"use client";

import { Send } from "lucide-react";
import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<{ kind: string; message: string }>({ kind: "", message: "" });
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setStatus({ kind: "", message: "" });
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message);
      form.reset(); setStatus({ kind: "success", message: result.message });
    } catch (error) { setStatus({ kind: "error", message: error instanceof Error ? error.message : "Envoi impossible." }); }
    finally { setPending(false); }
  }
  return <form className="contact-form contact-message-form reveal" onSubmit={submit}>
    <div className="form-heading"><span>Envoyer un message</span><p>Nous vous répondrons par e-mail.</p></div>
    <label>Nom complet *<input name="name" type="text" autoComplete="name" maxLength={100} required /></label>
    <label>E-mail *<input name="email" type="email" autoComplete="email" maxLength={150} required /></label>
    <label>Votre message *<textarea name="message" rows={5} maxLength={3000} required /></label>
    <input type="text" name="website" className="form-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    <p className={`contact-feedback ${status.kind}`} aria-live="polite">{status.message}</p>
    <button type="submit" className="btn-primary" disabled={pending}>{pending ? "Envoi…" : "Envoyer le message"} <Send /></button>
  </form>;
}
