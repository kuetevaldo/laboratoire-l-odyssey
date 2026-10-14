import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiSuccess<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status, headers: { "Cache-Control": "no-store" } });
}

export function apiError(message: string, status = 400) {
  if (message === "Requête non autorisée." && status === 400) status = 403;
  return NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "no-store" } });
}

export function readableError(error: unknown, fallback = "Une erreur est survenue."): string {
  if (error instanceof ZodError) return error.issues[0]?.message || fallback;
  if (error instanceof Error && error.message === "Invalid request origin.") return "Requête non autorisée.";
  if (error instanceof Error && /^(Le|La|L’|Utilisez|Choisissez)/.test(error.message)) return error.message;
  return fallback;
}
