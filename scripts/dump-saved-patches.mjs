import fs from "fs";

const transcriptPath =
  "C:\\Users\\raafa\\.cursor\\projects\\c-Users-raafa-Documents-alpha-bible\\agent-transcripts\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8\\8330bc8b-16b4-49c6-9fa3-e9f85dd232c8.jsonl";
const lines = fs.readFileSync(transcriptPath, "utf8").split("\n");

for (const lineNum of [1709, 1712, 1718, 1719, 1720, 1761]) {
  const obj = JSON.parse(lines[lineNum - 1]);
  for (const item of obj.message.content) {
    if (item?.name !== "StrReplace") continue;
    const p = item.input?.path || "";
    if (!p.includes("SavedVersesPremiumScreen")) continue;
    console.log("\n=== LINE", lineNum);
    console.log("OLD:", (item.input.old_string || "").slice(0, 300));
    console.log("NEW:", (item.input.new_string || "").slice(0, 500));
  }
}
