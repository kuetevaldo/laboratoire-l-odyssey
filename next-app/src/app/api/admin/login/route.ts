import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { administrators } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { createAdminSession, verifyPassword } from "@/lib/auth";
import { assertSameOrigin, clearRateLimit, isRateLimited, recordRateFailure, requestIp } from "@/lib/security";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  let rateKey = `admin:${requestIp(request)}`;
  try {
    assertSameOrigin(request);
    const input = adminLoginSchema.parse(await request.json());
    rateKey = `${rateKey}:${input.username.toLowerCase()}`;
    if (await isRateLimited(rateKey, 5, 15)) return apiError("Trop de tentatives. Réessayez dans 15 minutes.", 429);
    const admin = await getDb().query.administrators.findFirst({ where: eq(administrators.username, input.username) });
    if (!admin || !(await verifyPassword(input.password, admin.passwordHash))) {
      await recordRateFailure(rateKey);
      return apiError("Identifiants incorrects.", 401);
    }
    await clearRateLimit(rateKey);
    await createAdminSession({ adminId: admin.id, username: admin.username, displayName: admin.displayName });
    return apiSuccess({ message: "Connexion réussie." });
  } catch (error) {
    return apiError(readableError(error, "Connexion impossible pour le moment."));
  }
}
