/**
 * Static verification: retention policy coercion matches DB CHECK constraint.
 * Run: node scripts/verify-retention-policy-coercion.mjs
 */

const ALLOWED = new Set(["on_read", "1h", "6h", "12h", "24h", "3d", "7d"]);
const LEGACY = { read: "on_read", hour: "1h", day: "24h", week: "7d", never: "on_read" };
const TIMER = {
  "بعد القراءة": "on_read",
  "٣٠ دقيقة": "1h",
  "30 دقيقة": "1h",
  ساعة: "1h",
  "٢٤ ساعة": "24h",
  "24 ساعة": "24h",
  "٧ أيام": "7d",
  "7 أيام": "7d",
};

function coerce(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (ALLOWED.has(trimmed)) return trimmed;
    if (trimmed in LEGACY) return LEGACY[trimmed];
    if (trimmed in TIMER) return TIMER[trimmed];
  }
  return "24h";
}

const cases = [
  ["بعد القراءة", "on_read"],
  ["٢٤ ساعة", "24h"],
  ["read", "on_read"],
  ["hour", "1h"],
  ["day", "24h"],
  ["week", "7d"],
  ["never", "on_read"],
  ["on_read", "on_read"],
  ["24h", "24h"],
  ["garbage", "24h"],
];

let failed = 0;
for (const [input, expected] of cases) {
  const got = coerce(input);
  const ok = got === expected && ALLOWED.has(got);
  if (!ok) {
    console.error(`FAIL ${JSON.stringify(input)} -> ${got} (expected ${expected})`);
    failed++;
  } else {
    console.log(`OK   ${JSON.stringify(input)} -> ${got}`);
  }
}

const insertPayload = {
  conversation_id: "<uuid>",
  sender_id: "<uuid>",
  kind: "text",
  body: "test message",
  retention_policy: coerce("بعد القراءة"),
};

console.log("\nSample insert payload:", JSON.stringify(insertPayload, null, 2));
console.log("\nDB constraint (target):");
console.log(
  "CHECK (retention_policy IN ('on_read', '1h', '6h', '12h', '24h', '3d', '7d'))",
);

process.exit(failed ? 1 : 0);
