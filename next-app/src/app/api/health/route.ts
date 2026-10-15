import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { administrators } from "@/db/schema";

export const dynamic = "force-dynamic";

function s3Status() {
  const endpoint = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3 || "";
  const accessKey = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || "";
  const secretKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || "";
  const bucket = process.env.S3_BUCKET || "";
  const region = process.env.S3_REGION || process.env.AWS_REGION || "";
  return {
    hasEndpoint: endpoint.length > 0,
    hasAccessKey: accessKey.length > 0,
    hasSecretKey: secretKey.length > 0,
    hasBucket: bucket.length > 0,
    hasRegion: region.length > 0,
    configured: Boolean(endpoint && accessKey && secretKey && bucket),
  };
}

export async function GET() {
  try {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) throw new Error("Database configuration is missing.");
    await getDb().execute(sql`select 1`);

    let dbHost = "unknown";
    try {
      dbHost = new URL(rawUrl).host;
    } catch {}

    const authSecret = process.env.AUTH_SECRET || "";
    const hasAuthSecret = authSecret.length >= 32;

    const adminRows = await getDb().select({ id: administrators.id }).from(administrators);

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        dbHost,
        hasAuthSecret,
        authSecretLength: authSecret.length,
        adminCount: adminRows.length,
        storage: s3Status(),
        timestamp: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unavailable",
        error: error instanceof Error ? error.message : "Database error",
        timestamp: new Date().toISOString(),
        storage: s3Status(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
