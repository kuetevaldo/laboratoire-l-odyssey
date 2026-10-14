import { desc } from "drizzle-orm";
import { ResultsManager, type ResultRow } from "@/components/admin/ResultsManager";
import { getDb } from "@/db";
import { patientResults } from "@/db/schema";

export default async function AdminResultsPage() {
  const rows = await getDb().select().from(patientResults).orderBy(desc(patientResults.uploadedAt));
  const results: ResultRow[] = rows.map((row) => ({ id: row.id, patientNumber: row.patientNumber, patientName: row.patientName, fileName: row.fileName, isActive: row.isActive, expiresAt: row.expiresAt, uploadedAt: row.uploadedAt.toISOString() }));
  return <><section className="admin-welcome"><div><h1>Résultats patients</h1><p>Publiez, activez, désactivez ou supprimez les documents confidentiels.</p></div></section><ResultsManager results={results} /></>;
}
