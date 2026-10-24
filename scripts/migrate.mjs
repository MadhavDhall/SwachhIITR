import { readdir, readFile } from "node:fs/promises";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL is not configured; skipping database migration");
  process.exit(0);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});

try {
  const migrationDirectory = new URL("../db/migrations/", import.meta.url);
  const migrationFiles = (await readdir(migrationDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    await pool.query(await readFile(new URL(file, migrationDirectory), "utf8"));
    console.log(`Applied ${file}`);
  }
  console.log("Database migrations completed");
} finally {
  await pool.end();
}
