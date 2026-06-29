/**
 * Apply media_library owner INSERT migration (Media Manager uploads).
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_DB_PASSWORD = "your-db-password"
 *   node scripts/apply-media-library-owner-insert.mjs
 *
 * Password: Supabase Dashboard → Project Settings → Database
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const PROJECT_REF = "usflbjlyadihyitnvzya";
const password = process.env.SUPABASE_DB_PASSWORD;

if (!password?.trim()) {
  console.error("Missing SUPABASE_DB_PASSWORD.");
  console.error("Set it from Supabase Dashboard → Settings → Database → Database password");
  process.exit(1);
}

const migrationPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "supabase",
  "migrations",
  "20260629140000_media_library_owner_insert.sql",
);

const VERIFY_SQL = `
select polname, polcmd
from pg_policy p
join pg_class c on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where (
  (n.nspname = 'public' and c.relname = 'media_library' and polname = 'media_library_owner_insert')
  or (n.nspname = 'storage' and c.relname = 'objects' and polname = 'alpha_media_owner_insert')
)
order by polname;
notify pgrst, 'reload schema';
`;

const connectionString =
  process.env.DATABASE_URL ??
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log("Connected. Applying media_library owner INSERT migration…");

  const sql = readFileSync(migrationPath, "utf8");
  await client.query(sql);

  console.log("Verifying policies…");
  const { rows } = await client.query(VERIFY_SQL);
  if (rows.length >= 2) {
    console.log("Policies verified:");
    for (const row of rows) console.log(`  - ${row.polname} (${row.polcmd})`);
    console.log("Done.");
  } else {
    console.warn("Expected 2 policies; found:", rows.length);
    for (const row of rows) console.log(`  - ${row.polname}`);
    process.exit(1);
  }

  await client.end();
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
