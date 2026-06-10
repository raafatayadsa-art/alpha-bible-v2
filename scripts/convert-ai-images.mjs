import { readdir, copyFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

async function processImages() {
  const assetsDir = 'C:\\Users\\raafa\\.cursor\\projects\\c-Users-raafa-Documents-alpha-bible\\assets';
  const targetDir = join(process.cwd(), 'public', 'bible-icons', 'books');
  
  try {
    const files = await readdir(assetsDir);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    
    for (const file of pngFiles) {
      const bookId = file.replace('.png', '');
      const sourcePath = join(assetsDir, file);
      const targetPath = join(targetDir, bookId + '.webp');
      
      console.log('Converting', file, 'to', targetPath);
      await sharp(sourcePath).webp({ quality: 90 }).toFile(targetPath);
    }
    console.log('Done converting ' + pngFiles.length + ' files.');
  } catch(e) {
    console.error(e);
  }
}
processImages();
