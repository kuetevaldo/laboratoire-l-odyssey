import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { patientResults } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { deleteObject } from "@/lib/storage";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await getAdminSessionFromRequest(request))) return apiError("Session expirée.", 401);
    const id = Number((await context.params).id);
    const { isActive } = z.object({ isActive: z.boolean() }).parse(await request.json());
    if (!Number.isInteger(id)) return apiError("Résultat invalide.");
    await getDb().update(patientResults).set({ isActive, updatedAt: new Date() }).where(eq(patientResults.id, id));
    return apiSuccess({ message: isActive ? "Résultat activé." : "Résultat désactivé." });
  } catch (error) {
    return apiError(readableError(error, "Impossible de modifier ce résultat."));
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await getAdminSessionFromRequest(request))) return apiError("Session expirée.", 401);
    const id = Number((await context.params).id);
    if (!Number.isInteger(id)) return apiError("Résultat invalide.");
    const result = await getDb().query.patientResults.findFirst({ where: eq(patientResults.id, id) });
    if (!result) return apiError("Résultat introuvable.", 404);
    await getDb().delete(patientResults).where(eq(patientResults.id, id));
    await deleteObject(result.objectKey).catch(() => undefined);
    return apiSuccess({ message: "Résultat supprimé." });
  } catch (error) {
    return apiError(readableError(error, "Impossible de supprimer ce résultat."));
  }
}
