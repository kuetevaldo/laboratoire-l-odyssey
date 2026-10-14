import "server-only";

import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "odyssey_admin_session";
const PATIENT_COOKIE = "odyssey_patient_session";

type AdminSession = { adminId: number; username: string; displayName: string };
type PatientSession = { resultIds: number[] };

function secret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters.");
  }
  return new TextEncoder().encode(value);
}

function secureCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function normalizeBcryptHash(hash: string): string {
  return hash.startsWith("$2y$") ? `$2b$${hash.slice(4)}` : hash;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, normalizeBcryptHash(hash));
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function createAdminSession(session: AdminSession): Promise<void> {
  const token = await new SignJWT({ ...session, kind: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
  (await cookies()).set(ADMIN_COOKIE, token, secureCookieOptions(60 * 60 * 8));
}

export async function clearAdminSession(): Promise<void> {
  (await cookies()).set(ADMIN_COOKIE, "", secureCookieOptions(0));
}

async function verifyAdminToken(token?: string): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== "admin" || typeof payload.adminId !== "number") return null;
    return {
      adminId: payload.adminId,
      username: String(payload.username ?? ""),
      displayName: String(payload.displayName ?? "Administrateur"),
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  return verifyAdminToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function getAdminSessionFromRequest(request: NextRequest): Promise<AdminSession | null> {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function createPatientSession(resultIds: number[]): Promise<void> {
  const token = await new SignJWT({ resultIds, kind: "patient" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret());
  (await cookies()).set(PATIENT_COOKIE, token, secureCookieOptions(60 * 15));
}

async function verifyPatientToken(token?: string): Promise<PatientSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.kind !== "patient" || !Array.isArray(payload.resultIds)) return null;
    return { resultIds: payload.resultIds.map(Number).filter(Number.isInteger) };
  } catch {
    return null;
  }
}

export async function getPatientSession(): Promise<PatientSession | null> {
  return verifyPatientToken((await cookies()).get(PATIENT_COOKIE)?.value);
}

export async function getPatientSessionFromRequest(request: NextRequest): Promise<PatientSession | null> {
  return verifyPatientToken(request.cookies.get(PATIENT_COOKIE)?.value);
}
