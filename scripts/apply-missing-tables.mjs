/**
 * Apply Alpha Connect MVP + Alpha Identity migrations to Supabase.
 *
 * Usage (PowerShell):
 *   $env:SUPABASE_DB_PASSWORD = "your-db-password"
 *   node scripts/apply-missing-tables.mjs
 *
 * Get password: Supabase Dashboard → Project Settings → Database
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

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "supabase");

const MIGRATION_FILES = [
  join(root, "migrations", "20250615160000_alpha_connect_mvp.sql"),
  join(root, "migrations", "20250616140000_alpha_connect_retention_policy_002.sql"),
  join(root, "migrations", "20250616150000_alpha_connect_on_read_immediate.sql"),
  join(root, "migrations", "20250615150000_alpha_digital_identity.sql"),
];

const EXTRA_SQL = `
grant select, insert, update on public.alpha_identities to authenticated;
alter table public.prayer_requests add column if not exists body text;
alter table public.prayer_requests add column if not exists request text;
notify pgrst, 'reload schema';
select tablename
from pg_tables
where schemaname = 'public'
  and tablename in (
    'alpha_connect_conversations',
    'alpha_connect_conversation_members',
    'alpha_connect_messages',
    'alpha_identities'
  )
order by tablename;
`;

const connectionString =
  process.env.DATABASE_URL ??
  `postgresql://postgres.${PROJECT_REF}:${encodeURIComponent(password)}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`;

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  console.log("Connected. Applying Alpha Connect MVP migrations…");

  for (const file of MIGRATION_FILES) {
    console.log("  →", file.split(/[/\\]/).slice(-2).join("/"));
    const sql = readFileSync(file, "utf8");
    await client.query(sql);
  }

  console.log("Applying grants + verify…");
  const result = await client.query(EXTRA_SQL);
  const rows = result.at(-1)?.rows ?? [];
  if (rows.length) {
    console.log("Tables verified:");
    for (const row of rows) console.log("  -", row.tablename);
  }
  console.log("Done.");
  await client.end();
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
