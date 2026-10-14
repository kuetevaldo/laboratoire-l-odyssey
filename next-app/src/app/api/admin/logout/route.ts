import type { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api";
import { clearAdminSession } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";

export async function POST(request: NextRequest) {
  assertSameOrigin(request);
  await clearAdminSession();
  return apiSuccess({ message: "Déconnexion réussie." });
}
