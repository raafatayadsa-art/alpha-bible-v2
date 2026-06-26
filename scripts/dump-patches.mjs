import fs from "fs";

const transcriptPath =
  "C:\\Users\\raafa\\.cursor\\projects\\c-Users-raafa-Documents-alpha-bible\\agent-transcripts\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8.jsonl";
const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");

for (const lineNum of [1742, 1745, 1747, 1755, 1760, 1778, 1799]) {
  const obj = JSON.parse(lines[lineNum - 1]);
  for (const item of obj.message.content) {
    if (item?.name !== "StrReplace") continue;
    const p = item.input?.path || "";
    if (!p.includes("$book.$chapter")) continue;
    const old = item.input.old_string || "";
    const neu = item.input.new_string || "";
    console.log("\n=== LINE", lineNum, "old len", old.length, "new len", neu.length);
    if (old.includes("VerseCard") || neu.includes("VerseCard") || neu.includes("FilePen") || neu.includes("onAddJournal")) {
      console.log("OLD SNIP:", old.slice(0, 200));
      console.log("NEW SNIP:", neu.slice(0, 400));
    }
  }
}
