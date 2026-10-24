import { readFile } from "node:fs/promises";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run migrations");
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

try {
  const migration = await readFile(
    new URL("../db/migrations/001_initial_schema.sql", import.meta.url),
    "utf8"
  );
  await pool.query(migration);
  console.log("Database migration completed");
} finally {
  await pool.end();
}
