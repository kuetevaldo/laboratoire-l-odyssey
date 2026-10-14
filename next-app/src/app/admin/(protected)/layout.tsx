import { count, eq } from "drizzle-orm";
import { AdminShell } from "@/components/admin/AdminShell";
import { getDb } from "@/db";
import { appointments, contactMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [appointmentCount, unreadCount] = await Promise.all([
    getDb().select({ value: count() }).from(appointments),
    getDb().select({ value: count() }).from(contactMessages).where(eq(contactMessages.isRead, false)),
  ]);
  return <AdminShell displayName={session.displayName} counts={{ appointments: appointmentCount[0]?.value ?? 0, messages: unreadCount[0]?.value ?? 0 }}>{children}</AdminShell>;
}
