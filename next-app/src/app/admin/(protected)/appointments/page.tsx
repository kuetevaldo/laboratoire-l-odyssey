import { asc } from "drizzle-orm";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AppointmentsTable, type AppointmentRow } from "@/components/admin/AppointmentsTable";
import { getDb } from "@/db";
import { appointments } from "@/db/schema";

export default async function AdminAppointmentsPage() {
  const rows = await getDb().select().from(appointments).orderBy(asc(appointments.appointmentDate), asc(appointments.appointmentTime));
  const serialized: AppointmentRow[] = rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
  return <><section className="admin-welcome"><div><h1>Rendez-vous</h1><p>Recherchez, filtrez et mettez à jour les demandes des patients.</p></div><Link className="admin-primary" href="/#appointment"><Plus /> Nouveau rendez-vous</Link></section><section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">Planning</p><h2>Toutes les demandes</h2></div><span className="admin-count">{rows.length} rendez-vous</span></div><AppointmentsTable initialRows={serialized} /></section></>;
}
