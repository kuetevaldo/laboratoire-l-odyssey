import { loadEnvConfig } from "@next/env";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

async function main() {
  loadEnvConfig(process.cwd());

  const databaseUrl = process.env.DATABASE_URL;
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || "Administrateur";

  if (!databaseUrl || !username || !password || password.length < 12) {
    throw new Error("Configure DATABASE_URL, ADMIN_USERNAME and an ADMIN_PASSWORD of at least 12 characters.");
  }

  const sql = neon(databaseUrl);
  const passwordHash = await bcrypt.hash(password, 12);
  await sql`insert into administrators (username, display_name, password_hash)
    values (${username}, ${displayName}, ${passwordHash})
    on conflict (username) do update set display_name = excluded.display_name, password_hash = excluded.password_hash, updated_at = now()`;
  console.log(`Administrator “${username}” is ready.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
