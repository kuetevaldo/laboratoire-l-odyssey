import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ Erreur : DATABASE_URL est absente des variables d'environnement (.env.local).");
  process.exit(1);
}

const sql = neon(databaseUrl);

function generateSecurePassword(length = 16): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*+-=";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  const targetUsername = args[0]?.trim();
  const explicitPassword = args[1]?.trim();

  console.log("=================================================");
  console.log(" Laboratoire L'Odyssey — Réinitialisation Admin");
  console.log("=================================================\n");

  // 1. Identify existing administrator accounts safely
  const existingAdmins = await sql`
    SELECT id, username, display_name, created_at, updated_at
    FROM administrators
    ORDER BY id ASC
  `;

  if (!existingAdmins || existingAdmins.length === 0) {
    console.error("❌ Aucun compte administrateur trouvé dans la table 'administrators'.");
    process.exit(1);
  }

  console.log(`Comptes administrateurs existants (${existingAdmins.length}) :`);
  for (const admin of existingAdmins) {
    console.log(` • ID: ${admin.id} | Identifiant: "${admin.username}" | Nom affiché: "${admin.display_name}"`);
  }
  console.log("");

  // 2. Select the administrator to reset
  let selectedAdmin = existingAdmins[0];
  if (targetUsername) {
    const found = existingAdmins.find(
      (a) => a.username.toLowerCase() === targetUsername.toLowerCase()
    );
    if (!found) {
      console.error(`❌ Administrateur avec l'identifiant "${targetUsername}" introuvable.`);
      process.exit(1);
    }
    selectedAdmin = found;
  }

  console.log(`Sélectionné pour réinitialisation : "${selectedAdmin.username}" (ID: ${selectedAdmin.id})`);

  // 3. Determine new password
  let newPassword = explicitPassword;
  let isGenerated = false;
  if (!newPassword) {
    newPassword = generateSecurePassword(16);
    isGenerated = true;
  } else if (newPassword.length < 12) {
    console.error("❌ Le mot de passe doit comporter au moins 12 caractères.");
    process.exit(1);
  }

  // 4. Hash password with bcrypt cost factor 12 (same as login & auth library)
  console.log("Hachage sécurisé du mot de passe (bcrypt, cost 12)...");
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  // 5. Update only the selected administrator record (do not delete or recreate)
  await sql`
    UPDATE administrators
    SET password_hash = ${newPasswordHash}, updated_at = NOW()
    WHERE id = ${selectedAdmin.id}
  `;

  // 6. Clear rate limits table so the account is immediately accessible
  const deletedLimits = await sql`
    DELETE FROM rate_limits
    RETURNING key
  `;
  console.log(`✓ Verrous de taux (rate limits) réinitialisés (${deletedLimits.length} clés nettoyées).`);

  console.log("\n=================================================");
  console.log("✅ RÉINITIALISATION RÉUSSIE !");
  console.log("=================================================");
  console.log(`Identifiant  : ${selectedAdmin.username}`);
  console.log(`Mot de passe : ${newPassword}`);
  if (isGenerated) {
    console.log("*(Ce mot de passe fort a été généré de façon aléatoire et sécurisée)*");
  }
  console.log("=================================================\n");
  console.log("Pour vous connecter :");
  console.log("1. Accédez à la page /admin/login (ex: http://localhost:3000/admin/login ou en production)");
  console.log(`2. Saisissez l'identifiant : ${selectedAdmin.username}`);
  console.log("3. Saisissez le mot de passe ci-dessus.");
  console.log("4. Une fois connecté, vous pouvez modifier votre mot de passe depuis la page Paramètres (/admin/settings).\n");
}

main().catch((error) => {
  console.error("❌ Erreur lors de la réinitialisation :", error);
  process.exit(1);
});
