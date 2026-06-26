/**
 * Premium OT portrait cards — 960×1280, category+order top, title bottom.
 * Run: node scripts/generate-bible-ot-portrait-cards.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  CARD_W,
  CARD_H,
  ensureFont,
  loadPathMap,
  loadTexture,
  rasterizeSvg,
  renderBookPortraitSvg,
} from "./lib/bible-portrait-art.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "bible-icons", "books");
const fontPath = join(root, "scripts", "assets", "NotoNaskhArabic-Bold.ttf");
const fontUrl = pathToFileURL(fontPath).href;

const OT_BOOKS = [
  { id: "Genesis", name: "التكوين", symbol: "creation", color: "#4a7c59", colorLight: "#7ab58a", category: "شريعة", order: 1 },
  { id: "Exodus", name: "الخروج", symbol: "staffSea", color: "#3d5a9a", colorLight: "#6a8ac4", category: "شريعة", order: 2 },
  { id: "Leviticus", name: "اللاويين", symbol: "altar", color: "#8a4545", colorLight: "#b87070", category: "شريعة", order: 3 },
  { id: "Numbers", name: "العدد", symbol: "tent", color: "#6a5a8a", colorLight: "#9588b0", category: "شريعة", order: 4 },
  { id: "Deuteronomy", name: "التثنية", symbol: "tablets", color: "#7a5a18", colorLight: "#b8893a", category: "شريعة", order: 5 },
  { id: "Joshua", name: "يشوع", symbol: "trumpet", color: "#4a9e6e", colorLight: "#72c49a", category: "تاريخ", order: 6 },
  { id: "Judges", name: "القضاة", symbol: "scales", color: "#5b6b8a", colorLight: "#8494b5", category: "تاريخ", order: 7 },
  { id: "Ruth", name: "راعوث", symbol: "wheat", color: "#c98a3c", colorLight: "#e8b86a", category: "تاريخ", order: 8 },
  { id: "1Samuel", name: "صموئيل الأول", symbol: "oil", color: "#4a6bb5", colorLight: "#7894d4", category: "تاريخ", order: 9 },
  { id: "2Samuel", name: "صموئيل الثاني", symbol: "throne", color: "#6a4ab5", colorLight: "#9578d4", category: "تاريخ", order: 10 },
  { id: "1Kings", name: "الملوك الأول", symbol: "crown", color: "#8a6ec1", colorLight: "#b09ae0", category: "تاريخ", order: 11 },
  { id: "2Kings", name: "الملوك الثاني", symbol: "crownThorns", color: "#6a543a", colorLight: "#9a8060", category: "تاريخ", order: 12 },
  { id: "1Chronicles", name: "أخبار الأيام الأول", symbol: "scroll", color: "#5a7aa8", colorLight: "#88a4cc", category: "تاريخ", order: 13 },
  { id: "2Chronicles", name: "أخبار الأيام الثاني", symbol: "temple", color: "#3d6a9a", colorLight: "#6a94c4", category: "تاريخ", order: 14 },
  { id: "Ezra", name: "عزرا", symbol: "scroll", color: "#4a6a8a", colorLight: "#7898b8", category: "تاريخ", order: 15 },
  { id: "Nehemiah", name: "نحميا", symbol: "wall", color: "#6a543a", colorLight: "#9a8068", category: "تاريخ", order: 16 },
  { id: "Tobit", name: "طوبيا", symbol: "fish", color: "#3d6a8a", colorLight: "#6a98b8", category: "تاريخ", order: 17 },
  { id: "Judith", name: "يهوديت", symbol: "sword", color: "#8a4545", colorLight: "#b87070", category: "تاريخ", order: 18 },
  { id: "Esther", name: "أستير", symbol: "scepter", color: "#a8548a", colorLight: "#d080b0", category: "تاريخ", order: 19 },
  { id: "1Maccabees", name: "المكابيين الأول", symbol: "shield", color: "#6a543a", colorLight: "#9a8068", category: "تاريخ", order: 20 },
  { id: "2Maccabees", name: "المكابيين الثاني", symbol: "faithShield", color: "#7a5a18", colorLight: "#b8893a", category: "تاريخ", order: 21 },
  { id: "Job", name: "أيوب", symbol: "ashes", color: "#5a5a6a", colorLight: "#888898", category: "حكمة", order: 22 },
  { id: "Psalms", name: "المزامير", symbol: "harp", color: "#d4af37", colorLight: "#e8cc70", category: "مزامير", order: 23 },
  { id: "Proverbs", name: "الأمثال", symbol: "lamp", color: "#b8893a", colorLight: "#d8b068", category: "حكمة", order: 24 },
  { id: "Ecclesiastes", name: "الجامعة", symbol: "sun", color: "#8a7355", colorLight: "#b8a080", category: "حكمة", order: 25 },
  { id: "SongOfSolomon", name: "نشيد الأنشاد", symbol: "rose", color: "#c44569", colorLight: "#e07090", category: "حكمة", order: 26 },
  { id: "Wisdom", name: "الحكمة", symbol: "lamp", color: "#b8893a", colorLight: "#e8cc70", category: "حكمة", order: 27 },
  { id: "Sirach", name: "يشوع بن سيراخ", symbol: "scroll", color: "#6a543a", colorLight: "#9a8068", category: "حكمة", order: 28 },
  { id: "Isaiah", name: "إشعياء", symbol: "wing", color: "#3d5a9a", colorLight: "#6a88c4", category: "نبوة", order: 29 },
  { id: "Jeremiah", name: "إرميا", symbol: "vessel", color: "#6a4a5a", colorLight: "#987888", category: "نبوة", order: 30 },
  { id: "Lamentations", name: "مراثي إرميا", symbol: "tears", color: "#4a5a7a", colorLight: "#7888a8", category: "نبوة", order: 31 },
  { id: "Baruch", name: "باروخ", symbol: "scroll", color: "#4a6a8a", colorLight: "#7898b8", category: "نبوة", order: 32 },
  { id: "Ezekiel", name: "حزقيال", symbol: "wheel", color: "#5a6a9a", colorLight: "#8898c8", category: "نبوة", order: 33 },
  { id: "Daniel", name: "دانيال", symbol: "lionDen", color: "#b8893a", colorLight: "#d8b068", category: "نبوة", order: 34 },
  { id: "Hosea", name: "هوشع", symbol: "covenant", color: "#a85450", colorLight: "#d08078", category: "نبوة", order: 35 },
  { id: "Joel", name: "يوئيل", symbol: "locust", color: "#4a7a5a", colorLight: "#78a888", category: "نبوة", order: 36 },
  { id: "Amos", name: "عاموس", symbol: "plumb", color: "#6a5a32", colorLight: "#988860", category: "نبوة", order: 37 },
  { id: "Obadiah", name: "عوبديا", symbol: "mountain", color: "#5a7a8a", colorLight: "#88a8b8", category: "نبوة", order: 38 },
  { id: "Jonah", name: "يونان", symbol: "fish", color: "#3d6a8a", colorLight: "#6a98b8", category: "نبوة", order: 39 },
  { id: "Micah", name: "ميخا", symbol: "scales", color: "#6a4ab5", colorLight: "#9878d4", category: "نبوة", order: 40 },
  { id: "Nahum", name: "ناحوم", symbol: "shield", color: "#4a5a6a", colorLight: "#788898", category: "نبوة", order: 41 },
  { id: "Habakkuk", name: "حبقوق", symbol: "watchtower", color: "#7a6a4a", colorLight: "#a89878", category: "نبوة", order: 42 },
  { id: "Zephaniah", name: "صفنيا", symbol: "fire", color: "#a85a3a", colorLight: "#d08868", category: "نبوة", order: 43 },
  { id: "Haggai", name: "حجي", symbol: "temple", color: "#b8893a", colorLight: "#d8b068", category: "نبوة", order: 44 },
  { id: "Zechariah", name: "زكريا", symbol: "lampstand", color: "#4a6bb5", colorLight: "#7894d4", category: "نبوة", order: 45 },
  { id: "Malachi", name: "ملاخي", symbol: "sunRays", color: "#d4a93a", colorLight: "#e8c868", category: "نبوة", order: 46 },
];

const pathMap = await loadPathMap(root);
const textureBuf = await loadTexture(root, "src/features/bible-v2/assets/ot-card-bg-v2.jpg", CARD_W, CARD_H);

await ensureFont(fontPath);
await mkdir(outDir, { recursive: true });

let ok = 0;
for (const book of OT_BOOKS) {
  const svg = renderBookPortraitSvg(book, pathMap, fontUrl, "ot");
  const buf = await rasterizeSvg(svg, textureBuf, 95);
  await writeFile(join(outDir, `${book.id}.webp`), buf);
  ok++;
  console.log(`✓ ${book.id}.webp — ${book.name}`);
}

console.log(`\nGenerated ${ok} OT portrait cards (${CARD_W}×${CARD_H})`);
