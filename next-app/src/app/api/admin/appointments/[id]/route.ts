import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { appointments } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";

const statusSchema = z.object({ status: z.enum(["pending", "confirmed", "completed", "cancelled"]) });

async function authorized(request: NextRequest): Promise<boolean> {
  return Boolean(await getAdminSessionFromRequest(request));
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await authorized(request))) return apiError("Session expirée.", 401);
    const id = Number((await context.params).id);
    if (!Number.isInteger(id)) return apiError("Rendez-vous invalide.");
    const input = statusSchema.parse(await request.json());
    const rows = await getDb().update(appointments).set({ status: input.status, updatedAt: new Date() }).where(eq(appointments.id, id)).returning({ id: appointments.id });
    if (!rows.length) return apiError("Rendez-vous introuvable.", 404);
    return apiSuccess({ message: "Statut mis à jour." });
  } catch (error) {
    return apiError(readableError(error, "Impossible de modifier ce rendez-vous."));
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await authorized(request))) return apiError("Session expirée.", 401);
    const id = Number((await context.params).id);
    if (!Number.isInteger(id)) return apiError("Rendez-vous invalide.");
    await getDb().delete(appointments).where(eq(appointments.id, id));
    return apiSuccess({ message: "Rendez-vous supprimé." });
  } catch (error) {
    return apiError(readableError(error, "Impossible de supprimer ce rendez-vous."));
  }
}
