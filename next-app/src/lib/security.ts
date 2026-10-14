import "server-only";

import { createHash } from "node:crypto";
import { and, eq, lt, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { rateLimits } from "@/db/schema";

export function requestIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

export function assertSameOrigin(request: NextRequest): void {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    throw new Error("Invalid request origin.");
  }
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const source = origin || referer;
  if (source) {
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const requestHost = forwardedHost || request.headers.get("host") || new URL(request.url).host;
    try {
      if (new URL(source).host.toLowerCase() !== requestHost.toLowerCase()) {
        throw new Error("Invalid request origin.");
      }
    } catch {
      throw new Error("Invalid request origin.");
    }
  }
}

function rateKey(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function isRateLimited(value: string, limit = 5, windowMinutes = 15): Promise<boolean> {
  const db = getDb();
  const key = rateKey(value);
  const windowStart = new Date(Date.now() - windowMinutes * 60_000);
  await db.delete(rateLimits).where(and(eq(rateLimits.key, key), lt(rateLimits.updatedAt, windowStart)));
  const row = await db.query.rateLimits.findFirst({ where: eq(rateLimits.key, key) });
  return Boolean(row && row.attempts >= limit);
}

export async function consumeRateLimit(value: string, limit = 5, windowMinutes = 15): Promise<boolean> {
  const db = getDb();
  const key = rateKey(value);
  const windowStart = new Date(Date.now() - windowMinutes * 60_000);
  await db.delete(rateLimits).where(and(eq(rateLimits.key, key), lt(rateLimits.updatedAt, windowStart)));
  const [row] = await db
    .insert(rateLimits)
    .values({ key, attempts: 1, windowStartedAt: new Date(), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: { attempts: sql`${rateLimits.attempts} + 1`, updatedAt: new Date() },
    })
    .returning({ attempts: rateLimits.attempts });
  return Boolean(row && row.attempts > limit);
}

export async function recordRateFailure(value: string): Promise<void> {
  const db = getDb();
  const key = rateKey(value);
  await db
    .insert(rateLimits)
    .values({ key, attempts: 1, windowStartedAt: new Date(), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: { attempts: sql`${rateLimits.attempts} + 1`, updatedAt: new Date() },
    });
}

export async function clearRateLimit(value: string): Promise<void> {
  await getDb().delete(rateLimits).where(eq(rateLimits.key, rateKey(value)));
}
