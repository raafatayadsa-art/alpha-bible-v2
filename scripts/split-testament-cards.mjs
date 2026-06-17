import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const source =
  "C:/Users/raafa/.cursor/projects/c-Users-raafa-Documents-alpha-bible/assets/c__Users_raafa_AppData_Roaming_Cursor_User_workspaceStorage_ec74969b54038ce1d816ec8551a08220_images_photo_2026-06-15_05-55-02-95a82700-3559-4e79-a653-d2b062b80f37.png";

const outDir = path.join(root, "src/features/bible-v2/assets");

const meta = await sharp(source).metadata();
const half = Math.floor(meta.width / 2);

await sharp(source)
  .extract({ left: 0, top: 0, width: half, height: meta.height })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(path.join(outDir, "new-testament-ref.jpg"));

await sharp(source)
  .extract({ left: half, top: 0, width: meta.width - half, height: meta.height })
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(path.join(outDir, "old-testament-ref.jpg"));

console.log("Split complete:", { width: meta.width, height: meta.height, half });
