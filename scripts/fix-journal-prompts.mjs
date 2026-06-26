import fs from "fs";
import path from "path";

const transcriptPath =
  "C:\\Users\\raafa\\.cursor\\projects\\c-Users-raafa-Documents-alpha-bible\\agent-transcripts\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8.jsonl";
const repoRoot = "c:\\Users\\raafa\\Documents\\alpha-bible";
const cutoff = 1804;

const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");
let lastWrite = null;
for (let i = 0; i < Math.min(lines.length, cutoff); i++) {
  let obj;
  try { obj = JSON.parse(lines[i]); } catch { continue; }
  for (const item of obj?.message?.content ?? []) {
    if (item?.type === "tool_use" && item.name === "Write") {
      const p = (item.input?.path || "").replace(/\\/g, "/").toLowerCase();
      if (p.includes("journal-prompts.ts")) lastWrite = item.input.contents;
    }
  }
}

if (lastWrite) {
  fs.writeFileSync(path.join(repoRoot, "src/features/bible-journal/journal-prompts.ts"), lastWrite, "utf8");
  console.log("journal-prompts write", lastWrite.length);
} else {
  console.log("no write for journal-prompts - checking line 1730 bundle");
}
