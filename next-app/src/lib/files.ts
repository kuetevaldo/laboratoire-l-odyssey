import "server-only";

import { randomUUID } from "node:crypto";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/upload-limits";

const imageTypes = new Map([
  ["image/jpeg", [0xff, 0xd8, 0xff]],
  ["image/png", [0x89, 0x50, 0x4e, 0x47]],
  ["image/webp", [0x52, 0x49, 0x46, 0x46]],
]);

function hasPrefix(bytes: Uint8Array, prefix: number[]): boolean {
  return prefix.every((value, index) => bytes[index] === value);
}

export async function readPdf(file: File): Promise<Uint8Array> {
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) throw new Error(`Le PDF doit peser moins de ${MAX_UPLOAD_LABEL}.`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (file.type !== "application/pdf" || !hasPrefix(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    throw new Error("Le fichier sélectionné doit être un PDF valide.");
  }
  return bytes;
}

export async function readImage(file: File): Promise<{ bytes: Uint8Array; extension: string }> {
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) throw new Error(`L’image doit peser moins de ${MAX_UPLOAD_LABEL}.`);
  const prefix = imageTypes.get(file.type);
  if (!prefix) throw new Error("Utilisez une image JPG, PNG ou WebP.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasPrefix(bytes, prefix)) throw new Error("Le fichier image est invalide.");
  if (file.type === "image/webp" && new TextDecoder().decode(bytes.slice(8, 12)) !== "WEBP") {
    throw new Error("Le fichier WebP est invalide.");
  }
  return { bytes, extension: file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1] };
}

export function privateResultKey(): string {
  return `results/${randomUUID()}.pdf`;
}

export function blogImageKey(extension: string): string {
  return `blog/${randomUUID()}.${extension}`;
}

export function safeDownloadName(name: string): string {
  return name.replace(/[\r\n"\\/]/g, "_").slice(0, 180) || "resultat.pdf";
}
