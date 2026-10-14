import { and, eq, ne } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { administrators } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { createAdminSession, getAdminSessionFromRequest, hashPassword, verifyPassword } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { settingsSchema } from "@/lib/validators";

export async function PATCH(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const session = await getAdminSessionFromRequest(request);
    if (!session) return apiError("Session expirée.", 401);
    const input = settingsSchema.parse(await request.json());
    const admin = await getDb().query.administrators.findFirst({ where: eq(administrators.id, session.adminId) });
    if (!admin || !(await verifyPassword(input.currentPassword, admin.passwordHash))) {
      return apiError("Le mot de passe actuel est incorrect.", 401);
    }
    const duplicate = await getDb().query.administrators.findFirst({ where: and(eq(administrators.username, input.username), ne(administrators.id, admin.id)) });
    if (duplicate) return apiError("Ce nom d’utilisateur est déjà utilisé.", 409);
    await getDb().update(administrators).set({
      username: input.username,
      displayName: input.displayName,
      passwordHash: input.newPassword ? await hashPassword(input.newPassword) : admin.passwordHash,
      updatedAt: new Date(),
    }).where(eq(administrators.id, admin.id));
    await createAdminSession({ adminId: admin.id, username: input.username, displayName: input.displayName });
    return apiSuccess({ message: "Profil administrateur mis à jour." });
  } catch (error) {
    return apiError(readableError(error, "Impossible de mettre à jour le profil."));
  }
}
