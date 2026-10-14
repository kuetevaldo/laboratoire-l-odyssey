import { getDb } from "@/db";
import { contactMessages } from "@/db/schema";
import { apiError, apiSuccess, readableError } from "@/lib/api";
import { assertSameOrigin, consumeRateLimit, requestIp } from "@/lib/security";
import { contactSchema } from "@/lib/validators";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const rateKey = `contact:${requestIp(request)}`;
  try {
    assertSameOrigin(request);
    if (await consumeRateLimit(rateKey, 6, 60)) return apiError("Trop de messages. Réessayez plus tard.", 429);
    const input = contactSchema.parse(await request.json());
    await getDb().insert(contactMessages).values({ name: input.name, email: input.email, message: input.message });
    return apiSuccess({ message: "Votre message a bien été envoyé." }, 201);
  } catch (error) {
    return apiError(readableError(error, "Impossible d’envoyer le message pour le moment."));
  }
}
