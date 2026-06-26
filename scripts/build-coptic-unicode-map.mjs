/**
 * One-time / CI script: extract CS + NEW_ATHANASIUS glyph maps from StMarkus xlsx
 * into browser-safe JSON for format-coptic-display.ts
 */
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const XLSX = path.join(
  __dirname,
  "../node_modules/@stmarkus/coptic-font-unicode-converter/all2Unicode_v3.xlsx",
);
const OUT_DIR = path.join(__dirname, "../src/lib/coptic-text/maps");

const COPTIC_FONT_COL_START = 6;
const COPTIC_FONT_COL_END = 34;
const COPTIC_FONT_ROW_START = 2;
const COPTIC_FONT_ROW_END = 113;
const COPTIC_FONT_UNICODE_COL = 5;
const SHEETNAME = "mapping";
const FONTS = ["CS", "NEW_ATHANASIUS", "COPTIC1", "KYRILLOS"];

async function extractMaps() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(XLSX);
  const worksheet = workbook.getWorksheet(SHEETNAME);
  const result = {};

  for (let colInd = COPTIC_FONT_COL_START; colInd < COPTIC_FONT_COL_END; colInd++) {
    const fontName = worksheet.getRow(1).getCell(colInd).value;
    if (!fontName || !FONTS.includes(String(fontName))) continue;

    const map = {};
    for (let rowInd = COPTIC_FONT_ROW_START; rowInd < COPTIC_FONT_ROW_END; rowInd++) {
      const unicodeVal = worksheet.getRow(rowInd).getCell(COPTIC_FONT_UNICODE_COL).value;
      const fontChar = worksheet.getRow(rowInd).getCell(colInd).value;
      if (fontChar && unicodeVal) {
        map[String(fontChar)] = String(unicodeVal);
      }
    }
    result[String(fontName)] = map;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "coptic-font-maps.json"), JSON.stringify(result));
  console.log("Wrote", path.join(OUT_DIR, "coptic-font-maps.json"));
  for (const [font, map] of Object.entries(result)) {
    console.log(`  ${font}: ${Object.keys(map).length} glyphs`);
  }
}

extractMaps().catch((e) => {
  console.error(e);
  process.exit(1);
});
