// Rasterize public/icon.svg → PWA PNG icons + favicon.ico via sharp.
// Maskable icon uses mic-splash-source.svg (mark only) with ~20% safe-zone padding.
// Notification badge: white mic silhouette on transparent ground (Android alpha mask).
//
//   npm run generate:icons

import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");

const BG = { r: 0xfa, g: 0xfa, b: 0xf7, alpha: 1 };
const DENSITY = 384;

/** Build a multi-resolution ICO from PNG buffers (PNG-in-ICO, Vista+). */
const toIco = (pngBuffers, dims) => {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let dataOffset = headerSize;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  for (let i = 0; i < count; i++) {
    const entryOffset = 6 + i * 16;
    const dim = dims[i];
    const size = pngBuffers[i].length;
    header.writeUInt8(dim >= 256 ? 0 : dim, entryOffset);
    header.writeUInt8(dim >= 256 ? 0 : dim, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(size, entryOffset + 8);
    header.writeUInt32LE(dataOffset, entryOffset + 12);
    dataOffset += size;
  }

  return Buffer.concat([header, ...pngBuffers]);
};

const iconSvg = readFileSync(join(publicDir, "icon.svg"));
const markSvg = readFileSync(join(publicDir, "mic-splash-source.svg"));

const rasterIcon = async (size) =>
  sharp(iconSvg, { density: DENSITY })
    .resize(size, size, { fit: "contain" })
    .png()
    .toFile(join(publicDir, `icon-${size}.png`));

const rasterAppleTouch = async () => {
  const mark = await sharp(iconSvg, { density: DENSITY })
    .resize(180, 180, {
      fit: "contain",
      background: BG,
    })
    .flatten({ background: BG })
    .removeAlpha()
    .png()
    .toBuffer();

  await sharp(mark).toFile(join(publicDir, "apple-touch-icon.png"));
};

const rasterMaskable = async () => {
  const canvas = 512;
  // ~20% margin each side → mark ≈ 60% of canvas
  const markSize = Math.round(canvas * 0.6);

  const mark = await sharp(markSvg, { density: DENSITY })
    .resize(markSize, markSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .flatten({ background: BG })
    .png()
    .toFile(join(publicDir, "icon-maskable-512.png"));
};

const rasterFavicon = async () => {
  const sizes = [16, 32, 48];
  const pngs = [];

  for (const size of sizes) {
    const png = await sharp(iconSvg, { density: DENSITY })
      .resize(size, size, { fit: "contain", background: BG })
      .flatten({ background: BG })
      .png()
      .toBuffer();
    pngs.push(png);
  }

  writeFileSync(join(publicDir, "favicon.ico"), toIco(pngs, sizes));
};

const rasterBadge = async () => {
  const canvas = 96;
  // ~10% margin each side → mark ≈ 80% of canvas for circular mask safety
  const markSize = Math.round(canvas * 0.8);
  // Android alpha-masks badge: white opaque glyph, fully transparent ground
  const whiteMarkSvg = Buffer.from(
    markSvg.toString("utf8").replaceAll("#C5A368", "#FFFFFF")
  );

  const mark = await sharp(whiteMarkSvg, { density: DENSITY })
    .resize(markSize, markSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(join(publicDir, "badge-96.png"));
};

await rasterIcon(192);
await rasterIcon(512);
await rasterAppleTouch();
await rasterMaskable();
await rasterFavicon();
await rasterBadge();

console.log(
  "Wrote icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png, favicon.ico, badge-96.png"
);
