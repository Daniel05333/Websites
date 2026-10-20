// Zet de originele foto's uit photos-src/ om naar AVIF + WebP in meerdere breedtes.
// EXIF (o.a. GPS) wordt niet meegenomen. Gebruik: npm run images
import sharp from 'sharp';
import { readdir, mkdir, writeFile, access } from 'node:fs/promises';
const exists = (f) => access(f).then(() => true, () => false);

const SRC = new URL('../photos-src/', import.meta.url).pathname;
const OUT = new URL('../assets/img/', import.meta.url).pathname;
const WIDTHS = [480, 800, 1200, 1800];
await mkdir(OUT, { recursive: true });

const manifest = {};
for (const file of (await readdir(SRC)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort()) {
  const name = file.replace(/\.[^.]+$/, '');
  const img = sharp(SRC + file).rotate();
  const { width, height } = await img.metadata();
  const widths = WIDTHS.filter((w) => w <= width);
  for (const w of widths) {
    if (await exists(`${OUT}${name}-${w}.avif`) && await exists(`${OUT}${name}-${w}.webp`)) continue; // al omgezet
    const r = img.clone().resize({ width: w }).modulate({ saturation: 1.04 });
    await r.clone().avif({ quality: 52, effort: 4 }).toFile(`${OUT}${name}-${w}.avif`);
    await r.clone().webp({ quality: 74 }).toFile(`${OUT}${name}-${w}.webp`);
  }
  // Kleine, zware blur als placeholder achter het beeld (voorkomt een leeg vlak tijdens laden).
  const lqip = await img.clone().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  manifest[name] = { w: width, h: height, widths, lqip: `data:image/webp;base64,${lqip.toString('base64')}` };
  console.log(name, width, 'x', height, widths.join(','));
}
await writeFile(`${OUT}manifest.json`, JSON.stringify(manifest, null, 1));
