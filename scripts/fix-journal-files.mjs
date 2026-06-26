import fs from "fs";
import path from "path";

const transcriptPath =
  "C:\\Users\\raafa\\.cursor\\projects\\c-Users-raafa-Documents-alpha-bible\\agent-transcripts\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8.jsonl";
const repoRoot = "c:\\Users\\raafa\\Documents\\alpha-bible";
const cutoff = 1804;

function restoreFile(targetName, relPath) {
  let content = null;
  const patches = [];
  const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");
  for (let i = 0; i < Math.min(lines.length, cutoff); i++) {
    let obj;
    try { obj = JSON.parse(lines[i]); } catch { continue; }
    for (const item of obj?.message?.content ?? []) {
      if (item?.type !== "tool_use") continue;
      const p = (item.input?.path || "").replace(/\\/g, "/").toLowerCase();
      if (!p.includes(targetName)) continue;
      if (item.name === "Write") content = item.input.contents;
      if (item.name === "StrReplace" && content) patches.push(item.input);
    }
  }
  if (!content) return { ok: false, reason: "no write" };
  for (const patch of patches) {
    if (content.includes(patch.old_string)) {
      content = content.replace(patch.old_string, patch.new_string);
    }
  }
  fs.writeFileSync(path.join(repoRoot, relPath), content, "utf8");
  return { ok: true, len: content.length };
}

console.log(JSON.stringify({
  journalPrompts: restoreFile("journal-prompts.ts", "src/features/bible-journal/journal-prompts.ts"),
  bibleJournalScreen: restoreFile("biblejournalpremiumscreen.tsx", "src/features/bible-journal/BibleJournalPremiumScreen.tsx"),
}, null, 2));
