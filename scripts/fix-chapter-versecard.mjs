import fs from "fs";
import path from "path";

const transcriptPath =
  "C:\\Users\\raafa\\.cursor\\projects\\c-Users-raafa-Documents-alpha-bible\\agent-transcripts\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8.jsonl";
const repoRoot = "c:\\Users\\raafa\\Documents\\alpha-bible";
const cutoffLine = 1804;
const target = "$book.$chapter.tsx";

function applyStrReplace(content, oldString, newString) {
  if (!content.includes(oldString)) return { content, applied: false };
  return { content: content.replace(oldString, newString), applied: true };
}

// seed from git before journal work (~line 1740) - use current file and replay from line 1742
let content = fs.readFileSync(path.join(repoRoot, "src/routes/$book.$chapter.tsx"), "utf8");
const patches = [];
const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");

for (let i = 0; i < Math.min(lines.length, cutoffLine); i++) {
  const lineNum = i + 1;
  if (lineNum < 1742) continue;
  let obj;
  try {
    obj = JSON.parse(lines[i]);
  } catch {
    continue;
  }
  const items = obj?.message?.content;
  if (!Array.isArray(items)) continue;
  for (const item of items) {
    if (item?.type !== "tool_use" || item.name !== "StrReplace") continue;
    const p = (item.input?.path || "").replace(/\\/g, "/");
    if (!p.toLowerCase().includes(target.toLowerCase())) continue;
    patches.push({ lineNum, old: item.input.old_string, new: item.input.new_string });
  }
}

let applied = 0;
let failed = [];
for (const patch of patches) {
  const r = applyStrReplace(content, patch.old, patch.new);
  if (r.applied) {
    content = r.content;
    applied++;
  } else {
    failed.push(patch.lineNum);
  }
}

fs.writeFileSync(path.join(repoRoot, "src/routes/$book.$chapter.tsx"), content, "utf8");
console.log(JSON.stringify({ patchCount: patches.length, applied, failed, hasFlexCol: content.includes("flex-col"), hasOnAddJournalNote: content.includes("onAddJournalNote"), hasFilePen: content.includes("FilePen") }, null, 2));
