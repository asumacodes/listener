"use client";

import ReadingPane from "@/components/desktop/ReadingPane";
import { PaneAction } from "@/components/desktop/reading-panes/PaneAction";
import { trackPaneAction } from "@/lib/analytics/events";
import { copyText } from "@/lib/desktop/clipboard";
import { downloadBrandKit } from "@/lib/ideas/brand-kit";
import { M1_CARDS } from "@/lib/ideas/cards";
import type { BrandColorPalette, RunResults } from "@/types/run-results";
import { useEffect, useRef, useState } from "react";

type BrandKitPaneProps = {
  results: RunResults | null;
  streaming?: boolean;
};

type Swatch = { name: string; hex: string };

const CARD =
  "rounded-2xl border border-border bg-white px-5 py-5 shadow-[0_1px_0_rgba(26,26,26,0.02)]";

const SECTION_LABEL =
  "text-[12px] font-medium tracking-[0.16em] text-gold-deep uppercase";

const VALUE_TILE =
  "flex min-h-[120px] flex-col rounded-2xl bg-canvas px-5 py-5";

const CopyGlyph = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden
    className="shrink-0"
  >
    <rect
      x="3.5"
      y="3.5"
      width="7"
      height="7"
      rx="1.25"
      stroke="currentColor"
      strokeWidth="1.25"
    />
    <path
      d="M8.5 3.5V2.75A1.25 1.25 0 0 0 7.25 1.5H2.75A1.25 1.25 0 0 0 1.5 2.75v4.5A1.25 1.25 0 0 0 2.75 8.5H3.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
  </svg>
);

const CheckGlyph = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden
    className="shrink-0"
  >
    <path
      d="M2.5 6.2 4.8 8.5 9.5 3.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type PaletteSwatchProps = {
  swatch: Swatch;
  copied: boolean;
  onCopy: (hex: string) => void;
};

const PaletteSwatch = ({ swatch, copied, onCopy }: PaletteSwatchProps) => (
  <button
    type="button"
    onClick={() => onCopy(swatch.hex)}
    aria-label={
      copied
        ? `Copied ${swatch.name} ${swatch.hex}`
        : `Copy ${swatch.name} ${swatch.hex}`
    }
    className="group/swatch text-left outline-none transition-transform duration-150 ease-out active:scale-[0.985] motion-reduce:active:scale-100"
  >
    <div
      className={`relative h-28 overflow-hidden rounded-2xl border transition duration-200 ease-out ${
        copied
          ? "border-black/15 ring-1 ring-black/5"
          : "border-black/[0.06] group-hover/swatch:border-black/12 group-focus-visible/swatch:border-black/20 group-focus-visible/swatch:ring-2 group-focus-visible/swatch:ring-black/10"
      }`}
      style={{ backgroundColor: swatch.hex }}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-black/[0.04] to-transparent transition-opacity duration-200 ease-out ${
          copied
            ? "opacity-100"
            : "opacity-0 group-hover/swatch:opacity-100 group-focus-visible/swatch:opacity-100"
        }`}
      />
      <span
        className={`absolute bottom-2.5 left-2.5 inline-flex min-w-[4.75rem] items-center justify-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-text uppercase shadow-[0_4px_14px_rgba(26,26,26,0.14)] transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          copied
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-95 opacity-0 group-hover/swatch:translate-y-0 group-hover/swatch:scale-100 group-hover/swatch:opacity-100 group-focus-visible/swatch:translate-y-0 group-focus-visible/swatch:scale-100 group-focus-visible/swatch:opacity-100"
        }`}
      >
        {copied ? <CheckGlyph /> : <CopyGlyph />}
        {copied ? "Copied" : "Copy"}
      </span>
    </div>
    <p className="mt-2.5 text-[13px] font-medium capitalize text-text">
      {swatch.name}
    </p>
    <p className="mt-0.5 font-mono text-[11px] tracking-[0.02em] text-muted">
      {swatch.hex}
    </p>
  </button>
);

const paletteSwatches = (palette: BrandColorPalette | undefined): Swatch[] => {
  if (!palette) return [];
  const rows: Swatch[] = [];
  if (palette.primary) rows.push({ name: "Primary", hex: palette.primary });
  if (palette.secondary)
    rows.push({ name: "Secondary", hex: palette.secondary });
  if (palette.accent) rows.push({ name: "Accent", hex: palette.accent });
  if (palette.neutral) rows.push({ name: "Neutral", hex: palette.neutral });
  if (palette.semantic) {
    Object.entries(palette.semantic).forEach(([name, hex]) => {
      if (hex) rows.push({ name, hex });
    });
  }
  return rows;
};

const fontFamilyFrom = (spec: string | undefined, fallback: string): string => {
  if (!spec) return fallback;
  const token = spec.split(/[,/]/)[0]?.trim() ?? "";
  if (!token) return fallback;
  return `"${token}", ${fallback}`;
};

/** Only split "Title — body" / "Title: body", never hyphenated words like Eco-consciousness. */
const parseBrandValue = (value: string): { title: string; body: string } => {
  const spaced = value.match(/^(.+?)\s+[—–]\s+(.+)$/);
  if (spaced) return { title: spaced[1].trim(), body: spaced[2].trim() };
  const colon = value.match(/^(.+?):\s+(.+)$/);
  if (colon) return { title: colon[1].trim(), body: colon[2].trim() };
  return { title: value.trim(), body: "" };
};

const BrandKitPane = ({ results, streaming = false }: BrandKitPaneProps) => {
  const brand = results?.brand ?? null;
  const swatches = paletteSwatches(brand?.colorPalette);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copiedTimer.current != null) window.clearTimeout(copiedTimer.current);
    },
    []
  );

  const hasContent =
    !!brand &&
    (!!brand.tagline ||
      swatches.length > 0 ||
      !!brand.typography?.heading ||
      !!brand.typography?.body ||
      !!brand.brandValues?.length);

  const onDownload = async () => {
    if (!brand) return;
    setBusy(true);
    try {
      await downloadBrandKit(brand);
      trackPaneAction("download", "desktop", { pane: "brand" });
    } finally {
      setBusy(false);
    }
  };

  const onCopyHex = async (hex: string) => {
    const ok = await copyText(hex);
    if (!ok) return;
    setCopiedHex(hex);
    if (copiedTimer.current != null) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopiedHex(null), 1600);
  };

  const sampleBody =
    brand?.tagline?.trim() ||
    "The street looks after its own — walks traded in trust, not cash.";

  return (
    <ReadingPane
      variant="board"
      eyebrow={`${streaming ? "Streaming · " : ""}Artifact 04 · ${M1_CARDS.brand.title}`}
      title={M1_CARDS.brand.title}
      actions={
        <PaneAction disabled={!brand || busy} onClick={() => void onDownload()}>
          {busy ? "Preparing…" : "↓ Download brand kit"}
        </PaneAction>
      }
    >
      {!hasContent ? (
        <p className="text-sm text-muted">Brand kit isn&apos;t available.</p>
      ) : (
        <div className="space-y-10">
          {brand?.tagline ? (
            <section>
              <div className="flex flex-col rounded-2xl bg-canvas px-6 py-8 gap-3">
                <p className={SECTION_LABEL}>Tagline</p>
                <p className="font-serif text-[42px] leading-[1.15] text-text">
                  {brand.tagline}
                </p>
              </div>
            </section>
          ) : null}

          {swatches.length ? (
            <section>
              <div className="flex flex-wrap items-baseline gap-3">
                <p className={SECTION_LABEL}>Palette</p>
                <p className="text-[12px] text-muted">
                  Click a swatch to copy its hex
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {swatches.map((s) => (
                  <PaletteSwatch
                    key={`${s.name}-${s.hex}`}
                    swatch={s}
                    copied={copiedHex === s.hex}
                    onCopy={(hex) => void onCopyHex(hex)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {brand?.typography?.heading || brand?.typography?.body ? (
            <section className="grid gap-3 md:grid-cols-2">
              {brand.typography?.heading ? (
                <div className={CARD}>
                  <div className="flex items-center justify-between gap-2 text-[10px] tracking-[0.14em] text-muted uppercase">
                    <span>Display</span>
                    <span className="normal-case tracking-normal text-gold-deep">
                      {brand.typography.heading}
                    </span>
                  </div>
                  <p
                    className="mt-4 text-[28px] leading-tight text-text"
                    style={{
                      fontFamily: fontFamilyFrom(
                        brand.typography.heading,
                        "var(--font-serif), Georgia, serif"
                      ),
                      fontWeight: 600,
                    }}
                  >
                    {brand.brandName ?? "Four walks, one street"}
                  </p>
                  <p
                    className="mt-4 text-[13px] text-muted"
                    style={{
                      fontFamily: fontFamilyFrom(
                        brand.typography.heading,
                        "var(--font-serif), Georgia, serif"
                      ),
                    }}
                  >
                    Aa Bb Cc — 0123456789
                  </p>
                </div>
              ) : null}
              {brand.typography?.body ? (
                <div className={CARD}>
                  <div className="flex items-center justify-between gap-2 text-[10px] tracking-[0.14em] text-muted uppercase">
                    <span>Text</span>
                    <span className="normal-case tracking-normal text-gold-deep">
                      {brand.typography.body}
                    </span>
                  </div>
                  <p
                    className="mt-4 text-[15px] leading-relaxed text-text"
                    style={{
                      fontFamily: fontFamilyFrom(
                        brand.typography.body,
                        "var(--font-sans), system-ui, sans-serif"
                      ),
                    }}
                  >
                    {sampleBody}
                  </p>
                  <p
                    className="mt-4 text-[13px] text-muted"
                    style={{
                      fontFamily: fontFamilyFrom(
                        brand.typography.body,
                        "var(--font-sans), system-ui, sans-serif"
                      ),
                    }}
                  >
                    Aa Bb Cc — 0123456789
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}

          {brand?.brandValues?.length ? (
            <section>
              <p className={SECTION_LABEL}>Brand values</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {brand.brandValues.map((value) => {
                  const { title, body } = parseBrandValue(value);
                  return (
                    <div key={value} className={VALUE_TILE}>
                      <p className="font-serif text-[22px] leading-snug text-text">
                        {title}
                      </p>
                      {body ? (
                        <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
                          {body}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </ReadingPane>
  );
};

export default BrandKitPane;
