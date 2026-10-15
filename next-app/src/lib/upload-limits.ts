export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "4 Mo";

export function uploadSizeError(): string {
  return `Le fichier doit peser moins de ${MAX_UPLOAD_LABEL}.`;
}
