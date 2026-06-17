/**
 * Verify Alpha Connect + Alpha Identity tables and RLS via Supabase REST.
 * Run: node scripts/verify-alpha-tables.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL ?? "https://usflbjlyadihyitnvzya.supabase.co";
const anonKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZmxiamx5YWRpaHlpdG52enlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3OTM5NDQsImV4cCI6MjA5NDM2OTk0NH0.rntQyBXmRPag1LtpVRCfIHdZbI3BAgV8rU5agbTgUNY";

const TABLES = [
  "alpha_connect_conversations",
  "alpha_connect_conversation_members",
  "alpha_connect_messages",
  "alpha_identities",
];

const sb = createClient(url, anonKey);

function status(label, ok, detail = "") {
  const mark = ok ? "OK" : "FAIL";
  console.log(`${mark.padEnd(5)} ${label}${detail ? ` — ${detail}` : ""}`);
}

async function tableExists(name) {
  const { error } = await sb.from(name).select("*").limit(1);
  if (!error) return { exists: true };
  const msg = error.message ?? String(error);
  if (/schema cache/i.test(msg)) return { exists: true, needsReload: true, msg };
  if (/does not exist/i.test(msg)) return { exists: false, msg };
  return { exists: true, rlsBlocked: true, msg };
}

async function main() {
  console.log("Supabase:", url);
  console.log("--- Tables ---");
  let allOk = true;
  let needsReload = false;
  for (const t of TABLES) {
    const r = await tableExists(t);
    if (!r.exists) {
      status(t, false, r.msg);
      allOk = false;
    } else if (r.needsReload) {
      status(t, true, "exists — run supabase/RELOAD_SCHEMA.sql");
      needsReload = true;
    } else {
      status(t, true, r.rlsBlocked ? `exists (${r.msg})` : "exists + REST OK");
    }
  }

  console.log("--- RLS smoke (anon) ---");
  const { data: convos, error: convErr } = await sb.from("alpha_connect_conversations").select("id").limit(1);
  status("anon read conversations", !convErr, convErr?.message ?? `${convos?.length ?? 0} rows`);

  const { error: idErr } = await sb.from("alpha_identities").select("user_id").limit(1);
  status("anon read alpha_identities", !idErr, idErr?.message ?? "allowed (empty or public)");

  const { error: insErr } = await sb.from("alpha_identities").insert({
    user_id: "00000000-0000-0000-0000-000000000001",
    alpha_id: "ALPHA-TEST",
    alpha_id_short: "A-TEST01",
  });
  status(
    "anon insert alpha_identities blocked",
    !!insErr,
    insErr ? insErr.message : "WARNING: insert succeeded without auth",
  );

  console.log("---");
  if (needsReload) {
    console.log("Action: run supabase/RUN_ALPHA_CONNECT_MVP.sql (includes NOTIFY pgrst)");
    console.log("   or supabase/RELOAD_SCHEMA.sql in SQL Editor");
  } else if (allOk) {
    console.log("All required tables present. Run RUN_ALPHA_CONNECT_MVP.sql if RPC/storage bucket missing.");
  } else {
    console.log("Some tables missing — run supabase/RUN_ALPHA_CONNECT_MVP.sql");
  }
  process.exit(allOk && !needsReload ? 0 : needsReload ? 2 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
