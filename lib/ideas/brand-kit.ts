// lib/ideas/brand-kit.ts
//
// Client-side brand-kit zip generation (ADR-019: brand-kit is a specification,
// not a rendered asset — no logo image, the kit hands a designer everything
// needed to produce one). Five files, named from brand.brandName.

import JSZip from "jszip";
import type { BrandResult } from "@/types/run-results";

const slugify = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "brand";

// ---- file builders ---------------------------------------------------------

const buildGuidelines = (b: BrandResult): string => {
  const lines: string[] = [];
  lines.push(`# ${b.brandName ?? "Brand"} — Brand Guidelines`, "");
  if (b.tagline) lines.push(`> ${b.tagline}`, "");
  if (b.brandValues?.length) {
    lines.push("## Brand values", "");
    b.brandValues.forEach((v) => lines.push(`- ${v}`));
    lines.push("");
  }
  const p = b.colorPalette;
  if (p && (p.primary || p.secondary || p.accent || p.neutral || p.semantic)) {
    lines.push("## Color palette", "");
    if (p.primary) lines.push(`- **Primary** — \`${p.primary}\``);
    if (p.secondary) lines.push(`- **Secondary** — \`${p.secondary}\``);
    if (p.accent) lines.push(`- **Accent** — \`${p.accent}\``);
    if (p.neutral) lines.push(`- **Neutral** — \`${p.neutral}\``);
    if (p.semantic && Object.keys(p.semantic).length) {
      lines.push("", "**Semantic**");
      Object.entries(p.semantic).forEach(([k, v]) =>
        lines.push(`- ${k} — \`${v}\``)
      );
    }
    lines.push("");
  }
  if (b.nameNotes?.length) {
    lines.push("## Name alternatives considered", "");
    b.nameNotes.forEach((n) => lines.push(`- ${n}`));
    lines.push("");
  }
  if (b.iconographyStyle) {
    lines.push("## Iconography", "", b.iconographyStyle, "");
  }
  if (b.moodboardPrompt) {
    lines.push("## Moodboard direction", "", b.moodboardPrompt, "");
  }
  return lines.join("\n");
};

const buildPaletteJson = (b: BrandResult): string => {
  const p = b.colorPalette ?? {};
  return JSON.stringify(
    {
      primary: p.primary ?? null,
      secondary: p.secondary ?? null,
      accent: p.accent ?? null,
      neutral: p.neutral ?? null,
      semantic: p.semantic ?? {},
    },
    null,
    2
  );
};

const buildTypography = (b: BrandResult): string => {
  const t = b.typography ?? {};
  const lines: string[] = [`# ${b.brandName ?? "Brand"} — Typography`, ""];
  if (t.heading) lines.push(`**Headings:** ${t.heading}`, "");
  if (t.body) lines.push(`**Body:** ${t.body}`, "");
  if (t.mono) lines.push(`**Monospace:** ${t.mono}`, "");
  if (!t.heading && !t.body && !t.mono) {
    lines.push("_No typography specified._");
  }
  return lines.join("\n");
};

const buildLogoDirection = (b: BrandResult): string => {
  const d = b.logoDirection;
  const lines: string[] = [`# ${b.brandName ?? "Brand"} — Logo Direction`, ""];
  lines.push(
    "_This is a brief for a designer or image tool, not a finished logo._",
    ""
  );
  if (d?.symbolConcept) lines.push(`**Concept:** ${d.symbolConcept}`, "");
  if (d?.form) lines.push(`**Form:** ${d.form}`, "");
  if (d?.style) lines.push(`**Style:** ${d.style}`, "");
  if (d?.avoidances?.length) {
    lines.push("", "**Avoid:**");
    d.avoidances.forEach((a) => lines.push(`- ${a}`));
    lines.push("");
  }
  if (b.logoPrompt) {
    lines.push("## Generation prompt", "", "```", b.logoPrompt, "```", "");
  }
  return lines.join("\n");
};

// palette-swatches.png — a simple horizontal swatch strip drawn on a canvas.
const buildSwatchPng = async (b: BrandResult): Promise<Blob | null> => {
  const p = b.colorPalette ?? {};
  const swatches = [p.primary, p.secondary, p.accent, p.neutral].filter(
    (c): c is string => typeof c === "string" && c.length > 0
  );
  if (!swatches.length) return null;
  if (typeof document === "undefined") return null;

  const W = 160;
  const H = 200;
  const canvas = document.createElement("canvas");
  canvas.width = W * swatches.length;
  canvas.height = H + 28;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  swatches.forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.fillRect(i * W, 0, W, H);
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(hex.toUpperCase(), i * W + W / 2, H + 18);
  });

  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), "image/png")
  );
};

// ---- public: build + trigger download --------------------------------------

export const downloadBrandKit = async (brand: BrandResult): Promise<void> => {
  const zip = new JSZip();
  const slug = slugify(brand.brandName ?? "brand");

  zip.file("brand-guidelines.md", buildGuidelines(brand));
  zip.file("palette.json", buildPaletteJson(brand));
  zip.file("typography.md", buildTypography(brand));
  zip.file("logo-direction.md", buildLogoDirection(brand));

  const swatch = await buildSwatchPng(brand);
  if (swatch) zip.file("palette-swatches.png", swatch);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug}-brand-kit.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
