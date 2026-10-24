import { Pool, type QueryResultRow } from "pg";

declare global {
  var wasteosDbPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });
}

export function getDb() {
  if (!globalThis.wasteosDbPool) {
    globalThis.wasteosDbPool = createPool();
  }
  return globalThis.wasteosDbPool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  values: unknown[] = []
) {
  return getDb().query<T>(text, values);
}
