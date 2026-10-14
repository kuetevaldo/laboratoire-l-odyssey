import { desc } from "drizzle-orm";
import { MessagesTable, type MessageRow } from "@/components/admin/MessagesTable";
import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";

export default async function AdminMessagesPage() {
  const rows = await getDb().select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  const serialized: MessageRow[] = rows.map((row) => ({ id: row.id, name: row.name, email: row.email, message: row.message, isRead: row.isRead, createdAt: row.createdAt.toISOString() }));
  return <><section className="admin-welcome"><div><h1>Messages</h1><p>Consultez les demandes envoyées depuis le formulaire de contact.</p></div></section><section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">Communication</p><h2>Tous les messages</h2></div><span className="admin-count">{rows.filter((row) => !row.isRead).length} non lus</span></div><MessagesTable initialRows={serialized} /></section></>;
}
