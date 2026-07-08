// KAN-38 item 1: rasterize the transparent mic mark (public/mic-splash-source.svg)
// onto a padded 1024x1024 transparent canvas → public/mic-splash-source.png.
// The SVG has no background; pwa-asset-generator then places the mic on #FAFAF7.

import sharp from "sharp";
import { readFileSync } from "node:fs";

const CANVAS = 1024;
// Render the 512 viewBox mic at ~50% of the canvas so it sits centered with
// wide margins — the splash should be a small centered mark, not full-bleed.
const MARK = 512;

const svg = readFileSync("./public/mic-splash-source.svg");

const mark = await sharp(svg, { density: 384 })
  .resize(MARK, MARK, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: CANVAS,
    height: CANVAS,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: mark, gravity: "centre" }])
  .png()
  .toFile("./public/mic-splash-source.png");

// Regenerate device splash PNGs + link tags (requires Chromium):
//   1. Ensure tmp-splash-links.html exists (minimal HTML shell).
//   2. npx pwa-asset-generator ./public/mic-splash-source.png ./public/splash \
//        --background "#FAFAF7" --splash-only --type png \
//        --path-override "/splash" --index ./tmp-splash-links.html
//   3. Fix hrefs in lib/splash/apple-touch-startup-links.tsx if paths drift.
