import "server-only";

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let sqlClient: NeonQueryFunction<false, false> | undefined;
let database: NeonHttpDatabase<typeof schema> | undefined;

function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  return url;
}

export function getSql(): NeonQueryFunction<false, false> {
  sqlClient ??= neon(databaseUrl());
  return sqlClient;
}

export function getDb(): NeonHttpDatabase<typeof schema> {
  database ??= drizzle(getSql(), { schema });
  return database;
}
