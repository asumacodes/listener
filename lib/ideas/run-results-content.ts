//
// Maps real run_results agent JSON onto the existing PipelineCardContent shapes
// (so PipelineCardBody renders it unchanged) and derives each card's state.
// Curated summaries per ADR-019 — the full doc lives in Confluence/download.

import {
  buildConfluenceSpaceUrl,
  buildJiraProjectUrl,
  buildRoadmapPageUrl,
} from "@/lib/ideas/launchpad";
import type {
  BrandContent,
  CompetitorRow,
  EngineeringSection,
  LinkOutContent,
  PipelineCardContent,
  PipelineCardId,
  PipelineCardState,
  PrdSection,
} from "@/types/pipeline-ui";
import type { RunResults } from "@/types/run-results";

const MAX_COMPETITORS = 4; // curated; rest via Confluence
const MAX_PRD_FEATURES = 5;
const MAX_ENG_TASKS = 4;

const hasText = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const nonEmptyArray = (v: unknown): v is unknown[] =>
  Array.isArray(v) && v.length > 0;

// ---- PRD (curated: oneLiner + problem + target user + must-haves) ----------
const mapPrd = (prd: RunResults["prd"]): PrdSection[] => {
  if (!prd) return [];
  const sections: PrdSection[] = [];

  if (hasText(prd.oneLiner)) {
    sections.push({ heading: "One-liner", body: prd.oneLiner.trim() });
  }
  if (hasText(prd.problem)) {
    sections.push({ heading: "Problem", body: prd.problem.trim() });
  }
  if (hasText(prd.targetUser)) {
    sections.push({ heading: "Target user", body: prd.targetUser.trim() });
  }

  const mustHave = prd.features?.must_have ?? [];
  if (nonEmptyArray(mustHave)) {
    sections.push({
      heading: "Must-have features",
      body: "",
      items: mustHave
        .slice(0, MAX_PRD_FEATURES)
        .map((f) => ({ title: f.title ?? "", description: f.description }))
        .filter((f) => f.title),
    });
  }

  return sections;
};

// ---- Competitors (curated: top N with positioning + key tradeoffs) ---------
const mapCompetitors = (
  competitors: RunResults["competitors"]
): CompetitorRow[] => {
  const list = competitors?.competitors ?? [];
  if (!nonEmptyArray(list)) return [];
  return list.slice(0, MAX_COMPETITORS).map((c) => ({
    name: c.name ?? "Unnamed",
    note: c.directOverlap ?? c.positioning ?? "",
    positioning: c.positioning,
    strengths: c.strengths,
    weaknesses: c.weaknesses,
    pricingModel: c.pricingModel,
    url: c.url,
  }));
};

// ---- Brand (direction + palette swatches + type) ---------------------------
export const brandPaletteHexes = (brand: RunResults["brand"]): string[] => {
  const p = brand?.colorPalette;
  if (!p) return [];
  const hexes = [p.primary, p.secondary, p.accent, p.neutral].filter(hasText);
  return hexes as string[];
};

const brandTypeLine = (brand: RunResults["brand"]): string => {
  const t = brand?.typography;
  if (!t) return "";
  const parts = [
    t.heading ? `${t.heading} display` : null,
    t.body ? `${t.body} text` : null,
  ].filter(Boolean);
  return parts.join(" · ");
};

const mapBrand = (brand: RunResults["brand"]): BrandContent | null => {
  if (!brand) return null;
  const direction = brand.logoDirection?.symbolConcept ?? brand.tagline ?? "";
  return {
    direction: hasText(brand.tagline) ? brand.tagline : direction,
    palette: brandPaletteHexes(brand),
    type: brandTypeLine(brand),
    tagline: brand.tagline,
    values: brand.brandValues,
  };
};

// ---- Engineering (curated: overview + stack + first milestones) ------------
const mapEngineering = (
  eng: RunResults["engineering"]
): EngineeringSection[] => {
  if (!eng) return [];
  const sections: EngineeringSection[] = [];

  if (hasText(eng.hld?.overview)) {
    sections.push({ heading: "Overview", body: eng.hld!.overview!.trim() });
  }

  if (eng.techStack && Object.keys(eng.techStack).length > 0) {
    const stack = Object.entries(eng.techStack)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
    sections.push({ heading: "Stack", body: stack });
  }

  const tasks = eng.engineeringTasks ?? [];
  if (nonEmptyArray(tasks)) {
    const body = tasks
      .slice(0, MAX_ENG_TASKS)
      .map((t) => t.title)
      .filter(hasText)
      .join(" · ");
    if (body) sections.push({ heading: "First milestones", body });
  }

  return sections;
};

// ---- Link-outs -------------------------------------------------------------
const mapJira = (jira: RunResults["jira"]): LinkOutContent => {
  const epics = jira?.epicsCreated?.length ?? 0;
  const stories = jira?.storiesCreated?.length ?? 0;
  const meta = [
    stories ? `${stories} issue${stories === 1 ? "" : "s"}` : null,
    epics ? `${epics} epic${epics === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return {
    meta: meta || "Jira project",
    cta: "View in Jira",
    href: buildJiraProjectUrl(jira?.projectKey),
  };
};

const mapConfluence = (
  confluence: RunResults["confluence"]
): LinkOutContent => {
  const pages = confluence?.pagesCreated?.length ?? 0;
  return {
    meta: pages ? `${pages} page${pages === 1 ? "" : "s"}` : "Confluence space",
    cta: "View in Confluence",
    href: buildConfluenceSpaceUrl(confluence?.spaceUrl, confluence?.spaceKey),
  };
};

const ROADMAP_TITLE_MATCH = /roadmap/i;

const findRoadmapPage = (confluence: RunResults["confluence"]) =>
  confluence?.pagesCreated?.find(
    (p) => p.title && ROADMAP_TITLE_MATCH.test(p.title)
  );

const mapRoadmap = (
  confluence: RunResults["confluence"]
): LinkOutContent | null => {
  const page = findRoadmapPage(confluence);
  const href = buildRoadmapPageUrl(confluence?.spaceKey, page?.id);
  if (!href) return null;
  return {
    meta: "Phased delivery plan",
    cta: "View roadmap",
    href,
  };
};

// ---- Public: content for one card (or null if nothing to render) -----------
export const getRunResultsCardContent = (
  id: PipelineCardId,
  results: RunResults | null,
  recordingTranscription: string
): PipelineCardContent | null => {
  if (!results) return null;

  switch (id) {
    case "transcript": {
      const text =
        (hasText(results.transcript) ? results.transcript : null) ??
        (hasText(recordingTranscription) ? recordingTranscription : null);
      return text ? { id: "transcript", text: text.trim() } : null;
    }
    case "competitor": {
      const rows = mapCompetitors(results.competitors);
      return rows.length ? { id: "competitor", rows } : null;
    }
    case "prd": {
      const sections = mapPrd(results.prd);
      return sections.length ? { id: "prd", sections } : null;
    }
    case "brand": {
      const brand = mapBrand(results.brand);
      return brand && (brand.direction || brand.palette.length)
        ? { id: "brand", brand }
        : null;
    }
    case "engineering": {
      const sections = mapEngineering(results.engineering);
      return sections.length ? { id: "engineering", sections } : null;
    }
    case "jira":
      return results.jira ? { id: "jira", link: mapJira(results.jira) } : null;
    case "confluence":
      return results.confluence
        ? { id: "confluence", link: mapConfluence(results.confluence) }
        : null;
    case "roadmap": {
      const link = mapRoadmap(results.confluence);
      return link ? { id: "confluence", link } : null;
    }
  }
};

// ---- Public: per-card state derivation -------------------------------------
// On a DONE run: a card is `populated` if content exists, else `empty`.
// Never `failed` on a done run (a hard stage failure marks the whole run failed).
export const deriveCardState = (
  id: PipelineCardId,
  results: RunResults | null,
  recordingTranscription: string
): PipelineCardState => {
  // Link cards: populated if the key/url exists, else failed (rare partial run).
  if (id === "jira") {
    return hasText(results?.jira?.projectKey) ? "populated" : "failed";
  }
  if (id === "confluence") {
    return hasText(results?.confluence?.spaceUrl) ||
      hasText(results?.confluence?.spaceKey)
      ? "populated"
      : "failed";
  }
  if (id === "roadmap") {
    const page = findRoadmapPage(results?.confluence ?? null);
    return page?.id ? "populated" : "empty";
  }

  const content = getRunResultsCardContent(id, results, recordingTranscription);
  return content ? "populated" : "empty";
};
