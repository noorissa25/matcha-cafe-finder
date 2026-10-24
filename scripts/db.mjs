// Runs a Prisma CLI command against the right schema for DATABASE_URL.
// Postgres URLs use prisma/schema.prisma as is. "file:" URLs get a generated
// SQLite copy (prisma/.sqlite/schema.prisma, git-ignored) so local dev needs no server.
//
// Usage: node scripts/db.mjs <prisma args...>   e.g. node scripts/db.mjs db push
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

process.loadEnvFile?.(".env");

const url = process.env.DATABASE_URL ?? "";
let schema = "prisma/schema.prisma";

if (url.startsWith("file:")) {
  const source = readFileSync(schema, "utf8");
  const sqlite = source.replace('provider = "postgresql"', 'provider = "sqlite"');
  const dir = path.join("prisma", ".sqlite");
  mkdirSync(dir, { recursive: true });
  schema = path.join(dir, "schema.prisma");
  writeFileSync(schema, sqlite);
}

const result = spawnSync("npx", ["prisma", ...process.argv.slice(2), "--schema", schema], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
