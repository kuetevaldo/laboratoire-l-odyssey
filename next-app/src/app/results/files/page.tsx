import { and, eq, inArray } from "drizzle-orm";
import { Download, Eye, FileText, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { patientResults } from "@/db/schema";
import { getPatientSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ResultFilesPage() {
  const session = await getPatientSession();
  if (!session?.resultIds.length) redirect("/results");
  const results = await getDb().select().from(patientResults).where(and(inArray(patientResults.id, session.resultIds), eq(patientResults.isActive, true)));
  if (!results.length) redirect("/results");
  return <main className="patient-results"><section className="patient-results-card">
    <Link className="back-link" href="/results"><LogOut size={16} /> Fermer cet espace</Link>
    <p className="eyebrow"><span /> Documents sécurisés</p><h1>Résultats de {results[0].patientName}</h1><p>Cette session confidentielle expire automatiquement après 15 minutes.</p>
    <div className="patient-results-list">{results.map((result) => <article className="patient-result-file" key={result.id}><FileText /><div><h2>{result.fileName}</h2><p>Publié le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(result.uploadedAt)}</p></div><a className="btn-secondary" href={`/api/patient-results/${result.id}`} target="_blank" rel="noreferrer"><Eye /> Ouvrir</a><a className="btn-primary" href={`/api/patient-results/${result.id}?download=1`}><Download /> Télécharger</a></article>)}</div>
  </section></main>;
}
