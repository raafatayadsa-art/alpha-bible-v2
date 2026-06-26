import fs from "fs";
import path from "path";

const transcriptPath =
  "C:\\Users\\raafa\\.cursor\\projects\\c-Users-raafa-Documents-alpha-bible\\agent-transcripts\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8.jsonl";
const repoRoot = "c:\\Users\\raafa\\Documents\\alpha-bible";
const cutoff = 1804;
const target = "journalreferencepicker.tsx";

let content = null;
const patches = [];
const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");

for (let i = 0; i < Math.min(lines.length, cutoff); i++) {
  const lineNum = i + 1;
  let obj;
  try { obj = JSON.parse(lines[i]); } catch { continue; }
  for (const item of obj?.message?.content ?? []) {
    if (item?.type !== "tool_use") continue;
    const p = (item.input?.path || "").replace(/\\/g, "/").toLowerCase();
    if (!p.includes(target)) continue;
    if (item.name === "Write") {
      content = item.input.contents;
      console.error("write", lineNum, content.length);
    }
    if (item.name === "StrReplace" && content) {
      patches.push(item.input);
    }
  }
}

for (const patch of patches) {
  if (content.includes(patch.old_string)) {
    content = content.replace(patch.old_string, patch.new_string);
  } else {
    console.error("fail patch", patch.old_string.slice(0, 60));
  }
}

const out = path.join(repoRoot, "src/features/bible-journal/JournalReferencePicker.tsx");
fs.writeFileSync(out, content, "utf8");
console.log("done", content.length, content.startsWith("import"));
