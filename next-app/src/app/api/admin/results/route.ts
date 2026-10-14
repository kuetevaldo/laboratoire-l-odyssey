import { z } from "zod";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { patientResults } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { getAdminSessionFromRequest, hashPassword } from "@/lib/auth";
import { privateResultKey, readPdf } from "@/lib/files";
import { assertSameOrigin } from "@/lib/security";
import { deleteObject, putObject } from "@/lib/storage";

const uploadSchema = z.object({
  patientNumber: z.string().trim().min(1).max(50),
  patientName: z.string().trim().min(2).max(100),
  accessCode: z.string().min(6).max(200),
  expiresAt: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
});

export async function POST(request: NextRequest) {
  let key = "";
  try {
    assertSameOrigin(request);
    if (!(await getAdminSessionFromRequest(request))) return apiError("Session expirée.", 401);
    const data = await request.formData();
    const input = uploadSchema.parse({
      patientNumber: data.get("patientNumber"), patientName: data.get("patientName"),
      accessCode: data.get("accessCode"), expiresAt: data.get("expiresAt") || "",
    });
    const file = data.get("file");
    if (!(file instanceof File)) return apiError("Sélectionnez un fichier PDF.");
    const bytes = await readPdf(file);
    key = privateResultKey();
    await putObject(key, bytes, "application/pdf");
    const [created] = await getDb().insert(patientResults).values({
      patientNumber: input.patientNumber,
      patientName: input.patientName,
      accessCodeHash: await hashPassword(input.accessCode),
      fileName: file.name.toLowerCase().endsWith(".pdf") ? file.name : `${file.name}.pdf`,
      objectKey: key,
      expiresAt: input.expiresAt || null,
    }).returning({ id: patientResults.id });
    return apiSuccess({ id: created.id, message: "Résultat publié avec succès." }, 201);
  } catch (error) {
    if (key) await deleteObject(key).catch(() => undefined);
    return apiError(readableError(error, "Impossible de publier ce résultat."));
  }
}
