import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await getAdminSessionFromRequest(request))) return apiError("Session expirée.", 401);
    const id = Number((await context.params).id);
    const { isRead } = z.object({ isRead: z.boolean() }).parse(await request.json());
    if (!Number.isInteger(id)) return apiError("Message invalide.");
    await getDb().update(contactMessages).set({ isRead, updatedAt: new Date() }).where(eq(contactMessages.id, id));
    return apiSuccess({ message: "Message mis à jour." });
  } catch (error) {
    return apiError(readableError(error, "Impossible de modifier ce message."));
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    if (!(await getAdminSessionFromRequest(request))) return apiError("Session expirée.", 401);
    const id = Number((await context.params).id);
    if (!Number.isInteger(id)) return apiError("Message invalide.");
    await getDb().delete(contactMessages).where(eq(contactMessages.id, id));
    return apiSuccess({ message: "Message supprimé." });
  } catch (error) {
    return apiError(readableError(error, "Impossible de supprimer ce message."));
  }
}
