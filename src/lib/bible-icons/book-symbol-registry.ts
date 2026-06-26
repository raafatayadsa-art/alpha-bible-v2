import type { BibleBookId } from "./BibleBookIcons";

export type BookSymbolDef = {
  symbol: string;
  color: string;
  colorLight: string;
  categoryAr: string;
  order: number;
};

/** Symbol + color per book — meaning-driven, matches reference card logic */
export const BOOK_SYMBOL_REGISTRY: Record<BibleBookId, BookSymbolDef> = {
  Genesis: { symbol: "creation", color: "#4a7c59", colorLight: "#7ab58a", categoryAr: "شريعة", order: 1 },
  Exodus: { symbol: "staffSea", color: "#3d5a9a", colorLight: "#6a8ac4", categoryAr: "شريعة", order: 2 },
  Leviticus: { symbol: "altar", color: "#8a4545", colorLight: "#b87070", categoryAr: "شريعة", order: 3 },
  Numbers: { symbol: "tent", color: "#6a5a8a", colorLight: "#9588b0", categoryAr: "شريعة", order: 4 },
  Deuteronomy: { symbol: "tablets", color: "#7a5a18", colorLight: "#b8893a", categoryAr: "شريعة", order: 5 },
  Joshua: { symbol: "trumpet", color: "#4a9e6e", colorLight: "#72c49a", categoryAr: "تاريخ", order: 6 },
  Judges: { symbol: "scales", color: "#5b6b8a", colorLight: "#8494b5", categoryAr: "تاريخ", order: 7 },
  Ruth: { symbol: "wheat", color: "#c98a3c", colorLight: "#e8b86a", categoryAr: "تاريخ", order: 8 },
  "1Samuel": { symbol: "oil", color: "#4a6bb5", colorLight: "#7894d4", categoryAr: "تاريخ", order: 9 },
  "2Samuel": { symbol: "throne", color: "#6a4ab5", colorLight: "#9578d4", categoryAr: "تاريخ", order: 10 },
  "1Kings": { symbol: "crown", color: "#8a6ec1", colorLight: "#b09ae0", categoryAr: "تاريخ", order: 11 },
  "2Kings": { symbol: "crownThorns", color: "#6a543a", colorLight: "#9a8060", categoryAr: "تاريخ", order: 12 },
  "1Chronicles": { symbol: "scroll", color: "#5a7aa8", colorLight: "#88a4cc", categoryAr: "تاريخ", order: 13 },
  "2Chronicles": { symbol: "temple", color: "#3d6a9a", colorLight: "#6a94c4", categoryAr: "تاريخ", order: 14 },
  Ezra: { symbol: "scroll", color: "#4a6a8a", colorLight: "#7898b8", categoryAr: "تاريخ", order: 15 },
  Nehemiah: { symbol: "wall", color: "#6a543a", colorLight: "#9a8068", categoryAr: "تاريخ", order: 16 },
  Tobit: { symbol: "fish", color: "#3d6a8a", colorLight: "#6a98b8", categoryAr: "تاريخ", order: 17 },
  Judith: { symbol: "sword", color: "#8a4545", colorLight: "#b87070", categoryAr: "تاريخ", order: 18 },
  Esther: { symbol: "scepter", color: "#a8548a", colorLight: "#d080b0", categoryAr: "تاريخ", order: 19 },
  "1Maccabees": { symbol: "shield", color: "#6a543a", colorLight: "#9a8068", categoryAr: "تاريخ", order: 20 },
  "2Maccabees": { symbol: "faithShield", color: "#7a5a18", colorLight: "#b8893a", categoryAr: "تاريخ", order: 21 },
  Job: { symbol: "ashes", color: "#5a5a6a", colorLight: "#888898", categoryAr: "حكمة", order: 22 },
  Psalms: { symbol: "harp", color: "#d4af37", colorLight: "#e8cc70", categoryAr: "مزامير", order: 23 },
  Proverbs: { symbol: "lamp", color: "#b8893a", colorLight: "#d8b068", categoryAr: "حكمة", order: 24 },
  Ecclesiastes: { symbol: "sun", color: "#8a7355", colorLight: "#b8a080", categoryAr: "حكمة", order: 25 },
  SongOfSolomon: { symbol: "rose", color: "#c44569", colorLight: "#e07090", categoryAr: "حكمة", order: 26 },
  Wisdom: { symbol: "lamp", color: "#b8893a", colorLight: "#e8cc70", categoryAr: "حكمة", order: 27 },
  Sirach: { symbol: "scroll", color: "#6a543a", colorLight: "#9a8068", categoryAr: "حكمة", order: 28 },
  Isaiah: { symbol: "wing", color: "#3d5a9a", colorLight: "#6a88c4", categoryAr: "نبوة", order: 29 },
  Jeremiah: { symbol: "vessel", color: "#6a4a5a", colorLight: "#987888", categoryAr: "نبوة", order: 30 },
  Lamentations: { symbol: "tears", color: "#4a5a7a", colorLight: "#7888a8", categoryAr: "نبوة", order: 31 },
  Baruch: { symbol: "scroll", color: "#4a6a8a", colorLight: "#7898b8", categoryAr: "نبوة", order: 32 },
  Ezekiel: { symbol: "wheel", color: "#5a6a9a", colorLight: "#8898c8", categoryAr: "نبوة", order: 33 },
  Daniel: { symbol: "lionDen", color: "#b8893a", colorLight: "#d8b068", categoryAr: "نبوة", order: 34 },
  Hosea: { symbol: "covenant", color: "#a85450", colorLight: "#d08078", categoryAr: "نبوة", order: 35 },
  Joel: { symbol: "locust", color: "#4a7a5a", colorLight: "#78a888", categoryAr: "نبوة", order: 36 },
  Amos: { symbol: "plumb", color: "#6a5a32", colorLight: "#988860", categoryAr: "نبوة", order: 37 },
  Obadiah: { symbol: "mountain", color: "#5a7a8a", colorLight: "#88a8b8", categoryAr: "نبوة", order: 38 },
  Jonah: { symbol: "fish", color: "#3d6a8a", colorLight: "#6a98b8", categoryAr: "نبوة", order: 39 },
  Micah: { symbol: "scales", color: "#6a4ab5", colorLight: "#9878d4", categoryAr: "نبوة", order: 40 },
  Nahum: { symbol: "shield", color: "#4a5a6a", colorLight: "#788898", categoryAr: "نبوة", order: 41 },
  Habakkuk: { symbol: "watchtower", color: "#7a6a4a", colorLight: "#a89878", categoryAr: "نبوة", order: 42 },
  Zephaniah: { symbol: "fire", color: "#a85a3a", colorLight: "#d08868", categoryAr: "نبوة", order: 43 },
  Haggai: { symbol: "temple", color: "#b8893a", colorLight: "#d8b068", categoryAr: "نبوة", order: 44 },
  Zechariah: { symbol: "lampstand", color: "#4a6bb5", colorLight: "#7894d4", categoryAr: "نبوة", order: 45 },
  Malachi: { symbol: "sunRays", color: "#d4a93a", colorLight: "#e8c868", categoryAr: "نبوة", order: 46 },
  Matthew: { symbol: "angel", color: "#3d5a9a", colorLight: "#6a88c4", categoryAr: "إنجيل", order: 1 },
  Mark: { symbol: "lion", color: "#6a4ab5", colorLight: "#9578d4", categoryAr: "إنجيل", order: 2 },
  Luke: { symbol: "ox", color: "#4a9e9e", colorLight: "#72c8c8", categoryAr: "إنجيل", order: 3 },
  John: { symbol: "eagle", color: "#4a9e6e", colorLight: "#72c49a", categoryAr: "إنجيل", order: 4 },
  Acts: { symbol: "keys", color: "#d4af37", colorLight: "#e8cc70", categoryAr: "سفر", order: 5 },
  Romans: { symbol: "crossHill", color: "#6a4ab5", colorLight: "#9578d4", categoryAr: "رسالة", order: 6 },
  "1Corinthians": { symbol: "column", color: "#3d5a9a", colorLight: "#6a88c4", categoryAr: "رسالة", order: 7 },
  "2Corinthians": { symbol: "letter", color: "#4a6bb5", colorLight: "#7894d4", categoryAr: "رسالة", order: 8 },
  Galatians: { symbol: "chains", color: "#8a6ec1", colorLight: "#b09ae0", categoryAr: "رسالة", order: 9 },
  Ephesians: { symbol: "church", color: "#4a9e9e", colorLight: "#72c8c8", categoryAr: "رسالة", order: 10 },
  Philippians: { symbol: "anchor", color: "#6a4ab5", colorLight: "#9578d4", categoryAr: "رسالة", order: 11 },
  Colossians: { symbol: "crownThorns", color: "#5a6a8a", colorLight: "#8898b8", categoryAr: "رسالة", order: 12 },
  "1Thessalonians": { symbol: "dawn", color: "#4a6bb5", colorLight: "#7894d4", categoryAr: "رسالة", order: 13 },
  "2Thessalonians": { symbol: "shield", color: "#3d5a9a", colorLight: "#6a88c4", categoryAr: "رسالة", order: 14 },
  "1Timothy": { symbol: "staff", color: "#8a4545", colorLight: "#b87070", categoryAr: "رسالة", order: 15 },
  "2Timothy": { symbol: "sword", color: "#6a5a4a", colorLight: "#988878", categoryAr: "رسالة", order: 16 },
  Titus: { symbol: "church", color: "#4a7a6a", colorLight: "#78a898", categoryAr: "رسالة", order: 17 },
  Philemon: { symbol: "handshake", color: "#b8893a", colorLight: "#d8b068", categoryAr: "رسالة", order: 18 },
  Hebrews: { symbol: "veil", color: "#8a6ec1", colorLight: "#b09ae0", categoryAr: "رسالة", order: 19 },
  James: { symbol: "quill", color: "#a85450", colorLight: "#d08078", categoryAr: "رسالة", order: 20 },
  "1Peter": { symbol: "fishAnchor", color: "#3d5a9a", colorLight: "#6a88c4", categoryAr: "رسالة", order: 21 },
  "2Peter": { symbol: "growth", color: "#4a6bb5", colorLight: "#7894d4", categoryAr: "رسالة", order: 22 },
  "1John": { symbol: "heartLight", color: "#4a9e6e", colorLight: "#72c49a", categoryAr: "رسالة", order: 23 },
  "2John": { symbol: "seal", color: "#5a7aa8", colorLight: "#88a4cc", categoryAr: "رسالة", order: 24 },
  "3John": { symbol: "house", color: "#6a5a8a", colorLight: "#9888b0", categoryAr: "رسالة", order: 25 },
  Jude: { symbol: "faithShield", color: "#8a4545", colorLight: "#b87070", categoryAr: "رسالة", order: 26 },
  Revelation: { symbol: "crown", color: "#d4af37", colorLight: "#e8cc70", categoryAr: "رؤيا", order: 27 },
};

const FALLBACK: BookSymbolDef = {
  symbol: "scroll",
  color: "#6a543a",
  colorLight: "#9a8068",
  categoryAr: "سفر",
  order: 0,
};

export function getBookSymbolDef(bookId: BibleBookId): BookSymbolDef {
  return BOOK_SYMBOL_REGISTRY[bookId] ?? FALLBACK;
}
