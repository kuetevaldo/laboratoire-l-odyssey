import { and, eq, gte, isNull, or } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { getDb } from "@/db";
import { patientResults } from "@/db/schema";
import { apiError } from "@/lib/api";
import { getPatientSessionFromRequest } from "@/lib/auth";
import { todayInDouala } from "@/lib/dates";
import { safeDownloadName } from "@/lib/files";
import { getObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getPatientSessionFromRequest(request);
  const id = Number((await context.params).id);
  if (!session || !Number.isInteger(id) || !session.resultIds.includes(id)) return apiError("Accès refusé.", 403);
  const today = todayInDouala();
  const result = await getDb().query.patientResults.findFirst({ where: and(
    eq(patientResults.id, id),
    eq(patientResults.isActive, true),
    or(isNull(patientResults.expiresAt), gte(patientResults.expiresAt, today)),
  ) });
  if (!result) return apiError("Résultat introuvable.", 404);
  const object = await getObject(result.objectKey);
  if (!object) return apiError("Fichier introuvable.", 404);
  const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
  const body = object.bytes.buffer.slice(object.bytes.byteOffset, object.bytes.byteOffset + object.bytes.byteLength) as ArrayBuffer;
  return new Response(body, {
    headers: {
      "Content-Type": object.contentType,
      "Content-Length": String(object.contentLength),
      "Content-Disposition": `${disposition}; filename="${safeDownloadName(result.fileName)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
