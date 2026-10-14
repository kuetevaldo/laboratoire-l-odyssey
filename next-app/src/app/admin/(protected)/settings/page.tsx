import { UserRoundCog } from "lucide-react";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  return <><section className="admin-welcome"><div><h1>Paramètres</h1><p>Gérez le nom, l’identifiant et le mot de passe du compte administrateur.</p></div></section><section className="admin-panel"><div className="admin-panel-head"><div><p className="admin-kicker">Compte connecté</p><h2>{admin.displayName}</h2></div><span className="admin-stat-icon green"><UserRoundCog /></span></div><SettingsForm username={admin.username} displayName={admin.displayName} /></section></>;
}
