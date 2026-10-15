import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";

export const dynamic = "force-dynamic";

function storageConfigured(): boolean {
  const endpoint = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3 || "";
  const accessKey = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
  const secretKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
  const bucket = process.env.S3_BUCKET || "";
  return Boolean(endpoint && accessKey && secretKey && bucket);
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) throw new Error("Database configuration is missing.");
    await getDb().execute(sql`select 1`);

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        storage: storageConfigured() ? "configured" : "unavailable",
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        status: "unavailable",
        database: "unavailable",
        storage: storageConfigured() ? "configured" : "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
