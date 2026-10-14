import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { administrators } from "@/db/schema";

export const dynamic = "force-dynamic";

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
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
