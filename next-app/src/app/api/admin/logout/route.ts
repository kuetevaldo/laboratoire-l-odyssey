import type { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api";
import { ADMIN_COOKIE, clearAdminSession, secureCookieOptions } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: NextRequest) {
  assertSameOrigin(request);
  await clearAdminSession();
  const response = apiSuccess({ message: "Déconnexion réussie." });
  response.cookies.set(ADMIN_COOKIE, "", secureCookieOptions(0));
  return response;
}
