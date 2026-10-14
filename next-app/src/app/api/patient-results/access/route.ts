import { and, eq, gte, isNull, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { patientResults } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { PATIENT_COOKIE, createPatientSession, secureCookieOptions, verifyPassword } from "@/lib/auth";
import { todayInDouala } from "@/lib/dates";
import { assertSameOrigin, clearRateLimit, isRateLimited, recordRateFailure, requestIp } from "@/lib/security";
import { patientAccessSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  let rateKey = `patient:${requestIp(request)}`;
  try {
    assertSameOrigin(request);
    const input = patientAccessSchema.parse(await request.json());
    rateKey = `${rateKey}:${input.patientNumber.toLowerCase()}`;
    if (await isRateLimited(rateKey, 6, 15)) return apiError("Trop de tentatives. Réessayez dans 15 minutes.", 429);
    const rows = await getDb().select().from(patientResults).where(and(
      eq(patientResults.patientNumber, input.patientNumber),
      eq(patientResults.isActive, true),
      or(isNull(patientResults.expiresAt), gte(patientResults.expiresAt, todayInDouala())),
    ));
    const accessible = [];
    for (const row of rows) {
      if (await verifyPassword(input.accessCode, row.accessCodeHash)) accessible.push(row);
    }
    if (!accessible.length) {
      await recordRateFailure(rateKey);
      return apiError("Numéro patient ou code confidentiel incorrect.", 401);
    }
    await clearRateLimit(rateKey);
    const token = await createPatientSession(accessible.map((row) => row.id));
    const response = apiSuccess({ message: "Accès autorisé.", patientName: accessible[0].patientName });
    response.cookies.set(PATIENT_COOKIE, token, secureCookieOptions(60 * 15));
    return response;
  } catch (error) {
    return apiError(readableError(error, "Impossible de vérifier vos accès pour le moment."));
  }
}
