import fs from "fs";
import path from "path";

const transcriptPath =
  "C:\\Users\\raafa\\.cursor\\projects\\c-Users-raafa-Documents-alpha-bible\\agent-transcripts\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8.jsonl";
const repoRoot = "c:\\Users\\raafa\\Documents\\alpha-bible";
const cutoffLine = 1804;

function applyStrReplace(content, oldString, newString) {
  if (!content.includes(oldString)) return { content, applied: false };
  return { content: content.replace(oldString, newString), applied: true };
}

const target = "savedversespremiumscreen.tsx";
let content = null;
let writeLine = null;
const patches = [];

const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");

for (let i = 0; i < Math.min(lines.length, cutoffLine); i++) {
  const lineNum = i + 1;
  let obj;
  try {
    obj = JSON.parse(lines[i]);
  } catch {
    continue;
  }
  const items = obj?.message?.content;
  if (!Array.isArray(items)) continue;

  for (const item of items) {
    if (item?.type !== "tool_use") continue;
    const inp = item.input ?? {};
    const p = (inp.path || "").replace(/\\/g, "/").toLowerCase();
    if (!p.includes(target)) continue;

    if (item.name === "Write") {
      content = inp.contents ?? "";
      writeLine = lineNum;
      console.error("WRITE at", lineNum, "len", content.length);
    }
    if (item.name === "StrReplace" && content !== null) {
      patches.push({ lineNum, old: inp.old_string, new: inp.new_string });
    }
  }
}

let applied = 0;
let failed = 0;
for (const patch of patches) {
  const r = applyStrReplace(content, patch.old, patch.new);
  if (r.applied) {
    content = r.content;
    applied++;
  } else {
    failed++;
    console.error("FAIL patch line", patch.lineNum);
  }
}

const out = path.join(repoRoot, "src/features/bible-saved/SavedVersesPremiumScreen.tsx");
fs.writeFileSync(out, content, "utf8");
console.log(JSON.stringify({ writeLine, applied, failed, finalLen: content.length, startsWithImport: content.startsWith("import") }, null, 2));
