import { uploadSizeError } from "@/lib/upload-limits";

type ApiResponse = {
  message?: string;
  [key: string]: unknown;
};

export async function readApiResponse(response: Response, fallback: string): Promise<ApiResponse> {
  let result: ApiResponse = {};

  if (response.headers.get("content-type")?.includes("application/json")) {
    try {
      result = (await response.json()) as ApiResponse;
    } catch {}
  }

  if (!response.ok) {
    if (response.status === 413) throw new Error(uploadSizeError());
    throw new Error(result.message || fallback);
  }

  return result;
}
