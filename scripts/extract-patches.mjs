import fs from "fs";

const transcriptPath =
  "C:\\Users\\raafa\\.cursor\\projects\\c-Users-raafa-Documents-alpha-bible\\agent-transcripts\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8.jsonl";
const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");

for (const lineNum of [1742, 1745, 1747, 1755, 1757, 1760, 1778, 1799, 1801]) {
  const obj = JSON.parse(lines[lineNum - 1]);
  let i = 0;
  for (const item of obj.message.content) {
    if (item?.name !== "StrReplace") continue;
    const p = item.input?.path || "";
    if (!p.includes("$book.$chapter")) continue;
    i++;
    const out = `c:/Users/raafa/Documents/alpha-bible/scripts/patch-${lineNum}-${i}.txt`;
    fs.writeFileSync(out, `=== OLD ===\n${item.input.old_string}\n\n=== NEW ===\n${item.input.new_string}`, "utf8");
    console.log("wrote", out);
  }
}
