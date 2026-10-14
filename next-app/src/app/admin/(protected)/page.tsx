import { count, desc, eq } from "drizzle-orm";
import { CalendarCheck, Clock3, FileText, Mail, Upload } from "lucide-react";
import Link from "next/link";
import { AppointmentsTable, type AppointmentRow } from "@/components/admin/AppointmentsTable";
import { MessagesTable, type MessageRow } from "@/components/admin/MessagesTable";
import { getDb } from "@/db";
import { appointments, contactMessages, patientResults } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

function appointmentRow(row: typeof appointments.$inferSelect): AppointmentRow { return { ...row, createdAt: row.createdAt.toISOString() }; }
function messageRow(row: typeof contactMessages.$inferSelect): MessageRow { return { ...row, createdAt: row.createdAt.toISOString(), updatedAt: undefined } as MessageRow; }

export default async function AdminDashboardPage() {
  const admin = await requireAdmin(); const db = getDb();
  const [appointmentTotal, pendingTotal, messageTotal, unreadTotal, resultTotal, recentAppointments, recentMessages] = await Promise.all([
    db.select({ value: count() }).from(appointments), db.select({ value: count() }).from(appointments).where(eq(appointments.status, "pending")),
    db.select({ value: count() }).from(contactMessages), db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.isRead, false)),
    db.select({ value: count() }).from(patientResults).where(eq(patientResults.isActive, true)),
    db.select().from(appointments).orderBy(desc(appointments.createdAt)).limit(5), db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(5),
  ]);
  const stats = [
    { value: appointmentTotal[0]?.value ?? 0, label: "Total rendez-vous", note: "Toutes demandes reçues", icon: CalendarCheck, color: "green" },
    { value: pendingTotal[0]?.value ?? 0, label: "En attente", note: "À traiter rapidement", icon: Clock3, color: "orange" },
    { value: messageTotal[0]?.value ?? 0, label: "Messages reçus", note: `${unreadTotal[0]?.value ?? 0} non lus`, icon: Mail, color: "blue" },
    { value: resultTotal[0]?.value ?? 0, label: "Résultats actifs", note: "Documents patients publiés", icon: FileText, color: "purple" },
  ];
  return <><section className="admin-welcome"><div><h1>Bonjour, {admin.displayName}</h1><p>Voici un aperçu de l’activité de votre laboratoire.</p></div><Link className="admin-primary" href="/admin/results"><Upload /> Ajouter un résultat</Link></section>
    <section className="admin-stats" aria-label="Statistiques">{stats.map((stat) => { const Icon = stat.icon; return <article className="admin-stat" key={stat.label}><span className={`admin-stat-icon ${stat.color}`}><Icon /></span><div><strong>{stat.value}</strong><span>{stat.label}</span><small>{stat.note}</small></div></article>; })}</section>
    <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">Planning</p><h2>Rendez-vous récents</h2></div><Link className="admin-secondary" href="/admin/appointments">Voir tous les rendez-vous</Link></div><AppointmentsTable initialRows={recentAppointments.map(appointmentRow)} compact /></section>
    <section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">Communication</p><h2>Messages récents</h2></div><Link className="admin-secondary" href="/admin/messages">Voir tous les messages</Link></div><MessagesTable initialRows={recentMessages.map(messageRow)} compact /></section>
  </>;
}
