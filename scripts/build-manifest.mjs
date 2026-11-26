/**
 * Scans /assets/custom/ for PNG, JPG, JPEG, SVG, WEBP files
 * and writes /assets/custom/manifest.json automatically.
 */

import fs from 'node:fs';
import path from 'node:path';

const customDir = path.resolve(process.cwd(), 'assets', 'custom');
const manifestPath = path.join(customDir, 'manifest.json');
const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp']);

if (!fs.existsSync(customDir)) {
  fs.mkdirSync(customDir, { recursive: true });
}

const files = fs
  .readdirSync(customDir, { withFileTypes: true })
  .filter((d) => d.isFile())
  .map((d) => d.name)
  .filter((name) => ALLOWED_EXT.has(path.extname(name).toLowerCase()))
  .sort();

fs.writeFileSync(manifestPath, JSON.stringify({ images: files }, null, 2) + '\n', 'utf8');
console.log(`Generated ${manifestPath} with ${files.length} image(s):`, files);

