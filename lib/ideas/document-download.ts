// lib/ideas/document-download.ts
//
// Client-side Markdown document generation from run_results (Section C, ADR
// superseding the Confluence-native-export half of ADR-019). One .md per
// content card, built from the same JSON the cards render. No auth, no backend.

import type {
  CompetitorsResult,
  EngineeringResult,
  PrdResult,
  RunResults,
} from "@/types/run-results";

const slugify = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "document";

const hasText = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

// ---- PRD (full doc — download is the exhaustive version, unlike the card) ---
const buildPrdDoc = (prd: PrdResult, productName: string): string => {
  const L: string[] = [`# ${productName} — Product Requirements`, ""];
  if (hasText(prd.oneLiner)) L.push(`> ${prd.oneLiner.trim()}`, "");
  if (hasText(prd.problem)) L.push("## Problem", "", prd.problem.trim(), "");
  if (hasText(prd.targetUser))
    L.push("## Target user", "", prd.targetUser.trim(), "");

  const buckets: [
    string,
    "must_have" | "should_have" | "could_have" | "wont_have",
  ][] = [
    ["Must have", "must_have"],
    ["Should have", "should_have"],
    ["Could have", "could_have"],
    ["Won't have", "wont_have"],
  ];
  const f = prd.features;
  if (f) {
    L.push("## Features", "");
    buckets.forEach(([label, key]) => {
      const items = f[key] ?? [];
      if (items.length) {
        L.push(`### ${label}`, "");
        items.forEach((it) =>
          L.push(
            `- **${it.title ?? ""}**${it.description ? ` — ${it.description}` : ""}`
          )
        );
        L.push("");
      }
    });
  }

  if (prd.successMetrics?.length) {
    L.push("## Success metrics", "");
    prd.successMetrics.forEach((m) =>
      L.push(`- **${m.metric ?? ""}**${m.target ? `: ${m.target}` : ""}`)
    );
    L.push("");
  }
  if (prd.openQuestions?.length) {
    L.push("## Open questions", "");
    prd.openQuestions.forEach((q) => L.push(`- ${q}`));
    L.push("");
  }
  return L.join("\n");
};

// ---- Competitors -----------------------------------------------------------
const buildCompetitorsDoc = (
  c: CompetitorsResult,
  productName: string
): string => {
  const L: string[] = [`# ${productName} — Competitive Landscape`, ""];
  if (hasText(c.marketSummary))
    L.push("## Market summary", "", c.marketSummary.trim(), "");
  if (hasText(c.ourPositioning))
    L.push("## Our positioning", "", c.ourPositioning.trim(), "");
  if (c.tableStakes?.length) {
    L.push("## Table stakes", "");
    c.tableStakes.forEach((t) => L.push(`- ${t}`));
    L.push("");
  }
  if (c.competitors?.length) {
    L.push("## Competitors", "");
    c.competitors.forEach((comp) => {
      L.push(`### ${comp.name ?? "Unnamed"}`, "");
      if (comp.url) L.push(`${comp.url}`, "");
      if (comp.positioning) L.push(comp.positioning, "");
      if (comp.pricingModel) L.push(`**Pricing:** ${comp.pricingModel}`, "");
      if (comp.strengths?.length) {
        L.push("**Strengths**");
        comp.strengths.forEach((s) => L.push(`- ${s}`));
      }
      if (comp.weaknesses?.length) {
        L.push("**Weaknesses**");
        comp.weaknesses.forEach((w) => L.push(`- ${w}`));
      }
      L.push("");
    });
  }
  if (c.differentiationOpportunities?.length) {
    L.push("## Differentiation opportunities", "");
    c.differentiationOpportunities.forEach((d) => L.push(`- ${d}`));
    L.push("");
  }
  return L.join("\n");
};

// ---- Engineering -----------------------------------------------------------
const buildEngineeringDoc = (
  e: EngineeringResult,
  productName: string
): string => {
  const L: string[] = [`# ${productName} — Engineering Outline`, ""];
  if (hasText(e.hld?.overview))
    L.push("## Overview", "", e.hld!.overview!.trim(), "");
  if (hasText(e.hld?.dataFlow))
    L.push("## Data flow", "", e.hld!.dataFlow!.trim(), "");
  if (e.hld?.components?.length) {
    L.push("## Components", "");
    e.hld.components.forEach((comp) =>
      L.push(
        `- **${comp.name ?? ""}**${comp.responsibility ? ` — ${comp.responsibility}` : ""}`
      )
    );
    L.push("");
  }
  if (e.techStack && Object.keys(e.techStack).length) {
    L.push("## Tech stack", "");
    Object.entries(e.techStack).forEach(([k, v]) => L.push(`- **${k}:** ${v}`));
    L.push("");
  }
  if (e.engineeringTasks?.length) {
    L.push("## Engineering tasks", "");
    e.engineeringTasks.forEach((t) =>
      L.push(
        `- **${t.title ?? ""}**${t.description ? ` — ${t.description}` : ""}`
      )
    );
    L.push("");
  }
  if (hasText(e.schemaSql))
    L.push("## Schema (SQL)", "", "```sql", e.schemaSql.trim(), "```", "");
  if (e.openEngineeringQuestions?.length) {
    L.push("## Open questions", "");
    e.openEngineeringQuestions.forEach((q) => L.push(`- ${q}`));
    L.push("");
  }
  return L.join("\n");
};

// ---- download trigger ------------------------------------------------------
const downloadMarkdown = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// ---- public ----------------------------------------------------------------
export type DownloadableDoc =
  | "prd"
  | "competitor"
  | "engineering"
  | "transcript";

const productNameFrom = (results: RunResults): string =>
  results.prd?.productName ?? results.brand?.brandName ?? "Murmur";

export const canDownloadDoc = (
  id: DownloadableDoc,
  results: RunResults | null
): boolean => {
  if (!results) return false;
  switch (id) {
    case "prd":
      return !!results.prd;
    case "competitor":
      return !!results.competitors?.competitors?.length;
    case "engineering":
      return !!results.engineering;
    case "transcript":
      return hasText(results.transcript);
  }
};

export const downloadCardDoc = (
  id: DownloadableDoc,
  results: RunResults
): void => {
  const product = productNameFrom(results);
  const slug = slugify(product);
  switch (id) {
    case "prd":
      if (results.prd)
        downloadMarkdown(`${slug}-prd.md`, buildPrdDoc(results.prd, product));
      return;
    case "competitor":
      if (results.competitors)
        downloadMarkdown(
          `${slug}-competitors.md`,
          buildCompetitorsDoc(results.competitors, product)
        );
      return;
    case "engineering":
      if (results.engineering)
        downloadMarkdown(
          `${slug}-engineering.md`,
          buildEngineeringDoc(results.engineering, product)
        );
      return;
    case "transcript":
      if (hasText(results.transcript))
        downloadMarkdown(
          `${slug}-transcript.md`,
          `# ${product} — Transcript\n\n${results.transcript.trim()}\n`
        );
      return;
  }
};
