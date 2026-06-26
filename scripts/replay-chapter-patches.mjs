import fs from "fs";
import path from "path";

const repoRoot = "c:\\Users\\raafa\\Documents\\alpha-bible";
const patchDir = path.join(repoRoot, "scripts");
const chapterPath = path.join(repoRoot, "src/routes/$book.$chapter.tsx");

function applyStrReplace(content, oldString, newString) {
  if (!content.includes(oldString)) return { content, applied: false };
  return { content: content.replace(oldString, newString), applied: true };
}

let content = fs.readFileSync(chapterPath, "utf8");
// remove duplicate import if present
content = content.replace(
  'import { stashJournalVersePrefill } from "@/lib/bible-journal-prefill";\nimport { stashJournalVersePrefill } from "@/lib/bible-journal-prefill";\n',
  'import { stashJournalVersePrefill } from "@/lib/bible-journal-prefill";\n',
);

const patchFiles = fs
  .readdirSync(patchDir)
  .filter((f) => /^patch-(1742|1745|1747|1755|1757|1760|1778|1799|1801)-\d+\.txt$/.test(f))
  .sort((a, b) => {
    const [, la, na] = a.match(/^patch-(\d+)-(\d+)\.txt$/) || [];
    const [, lb, nb] = b.match(/^patch-(\d+)-(\d+)\.txt$/) || [];
    return Number(la) - Number(lb) || Number(na) - Number(nb);
  });

let applied = 0;
const failed = [];
for (const file of patchFiles) {
  const raw = fs.readFileSync(path.join(patchDir, file), "utf8");
  const oldPart = raw.split("=== NEW ===")[0].replace("=== OLD ===\n", "").replace(/\n$/, "");
  const newPart = raw.split("=== NEW ===\n")[1]?.replace(/\n$/, "") ?? "";
  const r = applyStrReplace(content, oldPart, newPart);
  if (r.applied) {
    content = r.content;
    applied++;
  } else {
    failed.push(file);
  }
}

fs.writeFileSync(chapterPath, content, "utf8");
console.log(JSON.stringify({ applied, failedCount: failed.length, failed, hasFilePen: content.includes("FilePen"), hasOnAddJournalNote: content.includes("onAddJournalNote"), hasOnOpenJournal: content.includes("onOpenJournal") }, null, 2));
