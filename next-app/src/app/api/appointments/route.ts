import { getDb } from "@/db";
import { appointments } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { assertSameOrigin, consumeRateLimit, requestIp } from "@/lib/security";
import { appointmentSchema } from "@/lib/validators";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const rateKey = `appointment:${requestIp(request)}`;
  try {
    assertSameOrigin(request);
    if (await consumeRateLimit(rateKey, 8, 60)) return apiError("Trop de demandes. Réessayez plus tard.", 429);
    const input = appointmentSchema.parse(await request.json());
    const appointmentAt = new Date(`${input.appointmentDate}T${input.appointmentTime}:00+01:00`);
    if (!Number.isFinite(appointmentAt.getTime()) || appointmentAt <= new Date()) {
      return apiError("Choisissez une date et une heure à venir.");
    }
    if (input.appointmentTime < "07:00" || input.appointmentTime > "20:00") {
      return apiError("Le laboratoire reçoit les rendez-vous de 07h à 20h.");
    }
    const [created] = await getDb().insert(appointments).values({
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      service: input.service,
      appointmentDate: input.appointmentDate,
      appointmentTime: input.appointmentTime,
      notes: input.notes || null,
    }).returning({ id: appointments.id });
    return apiSuccess({ id: created.id, message: "Votre demande a bien été envoyée. Notre équipe vous recontactera rapidement." }, 201);
  } catch (error) {
    return apiError(readableError(error, "Impossible d’envoyer la demande pour le moment."));
  }
}
