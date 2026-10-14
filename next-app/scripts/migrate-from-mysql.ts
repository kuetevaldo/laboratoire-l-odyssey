import { loadEnvConfig } from "@next/env";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { neon } from "@neondatabase/serverless";
import { createConnection, type Connection, type RowDataPacket } from "mysql2/promise";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

loadEnvConfig(process.cwd());

type LegacyRow = RowDataPacket & Record<string, unknown>;
const databaseUrl = process.env.DATABASE_URL;
const mysqlUrl = process.env.MYSQL_DATABASE_URL;
if (!databaseUrl || !mysqlUrl) throw new Error("DATABASE_URL and MYSQL_DATABASE_URL are required.");

const sql = neon(databaseUrl);
const source = await createConnection(mysqlUrl);
const legacyRoot = path.resolve(process.cwd(), process.env.LEGACY_PROJECT_DIR || "..");

async function rows(connection: Connection, query: string): Promise<LegacyRow[]> {
  const [result] = await connection.query<LegacyRow[]>(query);
  return result;
}

function dateValue(value: unknown): Date {
  if (value instanceof Date) return value;
  const parsed = new Date(String(value).replace(" ", "T") + (String(value).includes("Z") ? "" : "+01:00"));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function nullableDate(value: unknown): Date | null {
  return value ? dateValue(value) : null;
}

function text(value: unknown): string {
  return value == null ? "" : String(value);
}

async function upload(key: string, localFile: string, contentType: string): Promise<boolean> {
  let bytes: Buffer;
  try { bytes = await readFile(localFile); } catch { return false; }
  if (process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET) {
    const client = new S3Client({ endpoint: process.env.S3_ENDPOINT, region: process.env.S3_REGION || "us-east-2", forcePathStyle: true, credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY } });
    await client.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, Body: bytes, ContentType: contentType }));
  } else {
    const target = path.resolve(process.cwd(), process.env.LOCAL_STORAGE_DIR || ".data/uploads", key);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes); await writeFile(`${target}.meta.json`, JSON.stringify({ contentType }));
  }
  return true;
}

const targetCounts = await sql`select
  (select count(*)::int from appointments) appointments,
  (select count(*)::int from contact_messages) messages,
  (select count(*)::int from patient_results) results,
  (select count(*)::int from blog_posts) posts`;
if (Object.values(targetCounts[0]).some((value) => Number(value) > 0)) {
  throw new Error("The Neon destination already contains clinic data. Migration stopped to prevent duplicates.");
}

try {
  const admins = await rows(source, "SELECT * FROM administrators ORDER BY id");
  for (const row of admins) await sql`insert into administrators (username, display_name, password_hash, created_at, updated_at) values (${text(row.username)}, ${text(row.display_name) || "Administrateur"}, ${text(row.password_hash)}, ${dateValue(row.created_at)}, ${dateValue(row.updated_at || row.created_at)}) on conflict (username) do nothing`;

  const appointments = await rows(source, "SELECT * FROM appointments ORDER BY id");
  for (const row of appointments) await sql`insert into appointments (name, phone, email, service, appointment_date, appointment_time, notes, status, created_at, updated_at) values (${text(row.name)}, ${text(row.phone)}, ${text(row.email) || null}, ${text(row.service)}, ${text(row.appointment_date)}, ${text(row.appointment_time)}, ${text(row.notes) || null}, ${text(row.status)}, ${dateValue(row.created_at)}, ${dateValue(row.updated_at || row.created_at)})`;

  const messages = await rows(source, "SELECT * FROM contact_messages ORDER BY id");
  for (const row of messages) await sql`insert into contact_messages (name, email, message, is_read, created_at, updated_at) values (${text(row.name)}, ${text(row.email)}, ${text(row.message)}, ${Boolean(row.is_read)}, ${dateValue(row.created_at)}, ${dateValue(row.updated_at || row.created_at)})`;

  const results = await rows(source, "SELECT * FROM patient_results ORDER BY id");
  for (const row of results) {
    const storageName = path.basename(text(row.storage_name)); const key = `results/${storageName}`;
    if (!(await upload(key, path.join(legacyRoot, "storage", "results", storageName), "application/pdf"))) { console.warn(`Skipped missing result file: ${storageName}`); continue; }
    await sql`insert into patient_results (patient_number, patient_name, access_code_hash, file_name, object_key, is_active, expires_at, uploaded_at, updated_at) values (${text(row.patient_number)}, ${text(row.patient_name)}, ${text(row.access_code_hash)}, ${text(row.file_name)}, ${key}, ${Boolean(row.is_active)}, ${row.expires_at ? text(row.expires_at).slice(0, 10) : null}, ${dateValue(row.uploaded_at)}, ${dateValue(row.uploaded_at)})`;
  }

  const posts = await rows(source, "SELECT * FROM blog_posts ORDER BY id");
  for (const row of posts) {
    const legacyCover = text(row.cover_image); let coverKey: string | null = null;
    if (legacyCover.startsWith("images/blog/")) { const fileName = path.basename(legacyCover); const key = `blog/${fileName}`; const extension = path.extname(fileName).toLowerCase(); const mime = extension === ".png" ? "image/png" : extension === ".webp" ? "image/webp" : "image/jpeg"; if (await upload(key, path.join(legacyRoot, "images", "blog", fileName), mime)) coverKey = key; }
    await sql`insert into blog_posts (title, slug, excerpt, content, cover_object_key, is_published, published_at, created_at, updated_at) values (${text(row.title)}, ${text(row.slug)}, ${text(row.excerpt)}, ${text(row.content)}, ${coverKey}, ${Boolean(row.is_published)}, ${nullableDate(row.published_at)}, ${dateValue(row.created_at)}, ${dateValue(row.updated_at || row.created_at)}) on conflict (slug) do nothing`;
  }
  console.log(`Migration complete: ${appointments.length} appointments, ${messages.length} messages, ${results.length} results, ${posts.length} posts.`);
} finally {
  await source.end();
}
