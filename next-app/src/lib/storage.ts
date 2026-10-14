import "server-only";

import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredObject = {
  bytes: Uint8Array;
  contentType: string;
  contentLength: number;
};

let client: S3Client | undefined;

function storageConfiguration() {
  return {
    endpoint: process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3,
    region: process.env.S3_REGION || process.env.AWS_REGION || "us-east-2",
    accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET,
  };
}

function hasS3Configuration(): boolean {
  const config = storageConfiguration();
  return Boolean(config.endpoint && config.accessKeyId && config.secretAccessKey && config.bucket);
}

function s3Client(): S3Client {
  const config = storageConfiguration();
  client ??= new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId!,
      secretAccessKey: config.secretAccessKey!,
    },
  });
  return client;
}

function safeKey(key: string): string {
  if (!/^[a-zA-Z0-9/_\-.]+$/.test(key) || key.includes("..") || key.startsWith("/")) {
    throw new Error("Invalid object key.");
  }
  return key;
}

function localPath(key: string): string {
  const root = path.join(process.cwd(), ".data", "uploads");
  return path.join(root, ...safeKey(key).split("/"));
}

export async function putObject(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
  key = safeKey(key);
  if (hasS3Configuration()) {
    await s3Client().send(new PutObjectCommand({ Bucket: storageConfiguration().bucket!, Key: key, Body: bytes, ContentType: contentType }));
    return;
  }
  if (process.env.NODE_ENV === "production") throw new Error("S3 storage is not configured.");
  const target = localPath(key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
  await writeFile(`${target}.meta.json`, JSON.stringify({ contentType }));
}

export async function getObject(key: string): Promise<StoredObject | null> {
  key = safeKey(key);
  if (hasS3Configuration()) {
    try {
      const result = await s3Client().send(new GetObjectCommand({ Bucket: storageConfiguration().bucket!, Key: key }));
      if (!result.Body) return null;
      const bytes = await result.Body.transformToByteArray();
      return { bytes, contentType: result.ContentType || "application/octet-stream", contentLength: result.ContentLength || bytes.byteLength };
    } catch (error) {
      if (["NoSuchKey", "NotFound"].includes((error as { name?: string }).name || "")) return null;
      throw error;
    }
  }
  try {
    const target = localPath(key);
    const [bytes, metadata] = await Promise.all([
      readFile(target),
      readFile(`${target}.meta.json`, "utf8").then(JSON.parse).catch(() => ({ contentType: "application/octet-stream" })),
    ]);
    return { bytes, contentType: metadata.contentType, contentLength: bytes.byteLength };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function deleteObject(key: string): Promise<void> {
  key = safeKey(key);
  if (hasS3Configuration()) {
    await s3Client().send(new DeleteObjectCommand({ Bucket: storageConfiguration().bucket!, Key: key }));
    return;
  }
  const target = localPath(key);
  await Promise.all([unlink(target).catch(() => undefined), unlink(`${target}.meta.json`).catch(() => undefined)]);
}
