import fs from "fs";
import path from "path";

const transcriptPath =
  "C:\\Users\\raafa\\.cursor\\projects\\c-Users-raafa-Documents-alpha-bible\\agent-transcripts\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8.jsonl";
const repoRoot = "c:\\Users\\raafa\\Documents\\alpha-bible";
const cutoffLine = 1804;

const targetPatterns = [
  "saved-vault-tokens.ts",
  "SavedVersesPremiumScreen.tsx",
  "journal-vault-tokens.ts",
  "BibleJournalPremiumScreen.tsx",
  "JournalComposeSheet.tsx",
  "JournalReferencePicker.tsx",
  "JournalBibleSearchRow.tsx",
  "journal-prompts.ts",
  "bible-journal-state.ts",
  "bible-journal-prefill.ts",
  "chapter-verse-highlight.ts",
  "bible.saved.tsx",
  "bible.notes.tsx",
  "$book.$chapter.tsx",
];

function norm(p) {
  return p.replace(/\\/g, "/").toLowerCase();
}

function matchesTarget(filePath) {
  const n = norm(filePath);
  return targetPatterns.some((tf) => n.includes(tf.toLowerCase()));
}

function isLightTokenWrite(filePath, body) {
  const n = norm(filePath);
  if (!n.includes("vault-tokens")) return false;
  return body.includes("bibleV2Tokens") || body.includes('from "../tokens"') || body.includes('from "@/features/bible-v2/tokens"');
}

function applyStrReplace(content, oldString, newString) {
  if (!content.includes(oldString)) return { content, applied: false };
  return { content: content.replace(oldString, newString), applied: true };
}

function seedFromDisk(filePath) {
  const rel = path.relative(repoRoot, filePath);
  const disk = path.join(repoRoot, rel);
  if (fs.existsSync(disk)) return fs.readFileSync(disk, "utf8");
  return null;
}

const files = new Map();
const skipped = [];
const failedPatches = [];

const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");

for (let i = 0; i < Math.min(lines.length, cutoffLine); i++) {
  const lineNum = i + 1;
  const line = lines[i];
  if (!line.trim()) continue;
  let obj;
  try {
    obj = JSON.parse(line);
  } catch {
    continue;
  }

  const content = obj?.message?.content;
  if (!Array.isArray(content)) continue;

  for (const item of content) {
    if (item?.type !== "tool_use") continue;
    const name = item.name;
    const inp = item.input ?? {};

    if (name === "Write") {
      const filePath = inp.path;
      if (!filePath || !matchesTarget(filePath)) continue;
      const body = inp.contents ?? "";
      if (isLightTokenWrite(filePath, body)) {
        skipped.push({ lineNum, filePath, reason: "light vault tokens" });
        continue;
      }
      files.set(norm(filePath), { path: filePath, content: body, lastLine: lineNum, source: "write" });
    }

    if (name === "StrReplace") {
      const filePath = inp.path;
      if (!filePath || !matchesTarget(filePath)) continue;
      const key = norm(filePath);
      let existing = files.get(key);
      if (!existing) {
        const seed = seedFromDisk(filePath);
        if (seed) {
          existing = { path: filePath, content: seed, lastLine: 0, source: "seed" };
          files.set(key, existing);
        }
      }
      if (!existing) {
        failedPatches.push({ lineNum, filePath, reason: "no prior content" });
        continue;
      }
      const { content: next, applied } = applyStrReplace(existing.content, inp.old_string ?? "", inp.new_string ?? "");
      if (!applied) {
        failedPatches.push({ lineNum, filePath, reason: "old_string not found" });
      } else {
        files.set(key, { ...existing, content: next, lastLine: lineNum, source: existing.source === "seed" ? "seed+patch" : "patch" });
      }
    }
  }
}

const restored = [];
for (const [, info] of files) {
  const rel = path.relative(repoRoot, info.path);
  const dest = path.join(repoRoot, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, info.content, "utf8");
  restored.push({
    file: rel.replace(/\\/g, "/"),
    line: info.lastLine,
    source: info.source,
    bytes: Buffer.byteLength(info.content, "utf8"),
    hasSavedVault: info.content.includes("SAVED_VAULT"),
    hasJournalVault: info.content.includes("JOURNAL_VAULT"),
    hasBibleV2: info.content.includes("bibleV2Tokens"),
    hasDarkBg: /#030208|#050814|SAVED_VAULT\.bg|JOURNAL_VAULT\.bg/.test(info.content),
  });
}

const missing = targetPatterns.filter(
  (tf) => ![...files.keys()].some((k) => k.includes(tf.toLowerCase())),
);

console.log(JSON.stringify({ restored, skipped, missing, failedPatchCount: failedPatches.length }, null, 2));
