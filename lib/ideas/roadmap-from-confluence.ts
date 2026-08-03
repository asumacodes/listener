// lib/ideas/roadmap-from-confluence.ts
// Parse Confluence storage HTML into roadmap phase cards. No React.

export type RoadmapPhaseCard = {
  label: string;
  title: string;
  body: string;
};

export type RoadmapFromConfluence = {
  phases: RoadmapPhaseCard[];
  milestoneCount: number;
  blurb?: string;
  excerpt?: string;
};

const PHASE_HEADING = /^(?:phase\s*(\d+)\s*[—–:\-·|]?\s*(.*)|(\d+)\.\s+(.+))$/i;

const MOSCOW_TOKEN =
  /^(must(?:[\s-]?haves?)?|should(?:[\s-]?haves?)?|could(?:[\s-]?haves?)?|won'?t(?:[\s-]?haves?)?|will\s+not(?:[\s-]?haves?)?|out\s+of\s+scope)$/i;

const MOSCOW_SUFFIX =
  /^(.+?)\s*[—–\-:|]\s*(must(?:[\s-]?haves?)?|should(?:[\s-]?haves?)?|could(?:[\s-]?haves?)?|won'?t(?:[\s-]?haves?)?|will\s+not(?:[\s-]?haves?)?|out\s+of\s+scope)\s*$/i;

const SKIP_SECTION_TITLES =
  /^(roadmap|overview|introduction|summary|contents|table of contents|background|goals?|timeline|notes?)$/i;

const DEFAULT_BLURB =
  "Phased delivery plan, written as a Confluence page you can edit with your team.";

const DEGRADE_BLURB =
  "Open the roadmap in Confluence to edit phases and milestones — this pane only proves it exists.";

/** Decode common HTML entities (incl. em/en dashes) then strip tags. */
const decodeEntities = (raw: string): string =>
  raw
    .replace(/&nbsp;/gi, " ")
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8211;/g, "–")
    .replace(/&#x2014;/gi, "—")
    .replace(/&#x2013;/gi, "–")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCharCode(parseInt(h, 16))
    )
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeMoscowLabel = (raw: string): string => {
  const t = raw.replace(/\s+/g, " ").trim().toLowerCase();
  if (/^must/.test(t)) return "Must have";
  if (/^should/.test(t)) return "Should have";
  if (/^could/.test(t)) return "Could have";
  if (/won'?t|will not|out of scope/.test(t)) return "Out of scope";
  return raw.replace(/\s+/g, " ").trim();
};

type CleanHeading = {
  /** Status lozenge title when present (v0, V1, OUT OF SCOPE). */
  badge: string | null;
  text: string;
};

/**
 * Confluence status macros embed colour + title as parameter text.
 * Naive tag-stripping yields "Redv0 Foundation" — pull the badge out first.
 */
const cleanHeadingHtml = (headingHtml: string): CleanHeading => {
  let badge: string | null = null;
  let html = headingHtml;

  const statusRe =
    /<ac:structured-macro\b[^>]*ac:name=["']status["'][^>]*>([\s\S]*?)<\/ac:structured-macro>/gi;
  html = html.replace(statusRe, (_, inner: string) => {
    const title =
      inner.match(
        /<ac:parameter\b[^>]*ac:name=["']title["'][^>]*>([\s\S]*?)<\/ac:parameter>/i
      )?.[1] ??
      inner.match(/<ac:parameter\b[^>]*ac:name=["']title["'][^>]*\/>/i);
    const rawTitle = typeof title === "string" ? decodeEntities(title) : null;
    if (rawTitle) badge = rawTitle;
    return " ";
  });

  // Drop any other structured macros (info panels, etc.) without leaking params
  html = html.replace(
    /<ac:structured-macro\b[^>]*>[\s\S]*?<\/ac:structured-macro>/gi,
    " "
  );

  const text = decodeEntities(html);
  return { badge, text };
};

type Section = {
  level: number;
  /** Raw inner HTML of the heading (macros intact). */
  headingHtml: string;
  bodyHtml: string;
};

type RefinedHeading = { label: string; title: string };

/**
 * Map Confluence heading → card label/title.
 * e.g. status(v0) + "Foundation — Must have" → { label: "Must have", title: "Foundation" }
 */
const refineHeading = (headingHtml: string, index: number): RefinedHeading => {
  const { badge, text } = cleanHeadingHtml(headingHtml);
  const trimmed = text.trim();

  const moscowSplit = trimmed.match(MOSCOW_SUFFIX);
  if (moscowSplit) {
    return {
      label: normalizeMoscowLabel(moscowSplit[2]),
      title: moscowSplit[1].trim(),
    };
  }

  if (badge && /out\s*of\s*scope/i.test(badge)) {
    return {
      label: "Out of scope",
      title: trimmed || "Explicitly not building",
    };
  }

  if (badge && MOSCOW_TOKEN.test(badge)) {
    return {
      label: normalizeMoscowLabel(badge),
      title: trimmed || normalizeMoscowLabel(badge),
    };
  }

  const phase = trimmed.match(PHASE_HEADING);
  if (phase) {
    const num = phase[1] || phase[3];
    const name = (phase[2] || phase[4] || "").trim();
    return {
      label: num ? `Phase ${num}` : `Phase ${index}`,
      title: name || trimmed,
    };
  }

  if (/^phase\b/i.test(trimmed)) {
    return {
      label: `Phase ${index}`,
      title:
        trimmed.replace(/^phase\s*\d*\s*[—–:\-·|]?\s*/i, "").trim() || trimmed,
    };
  }

  if (badge && trimmed) {
    // Version lozenge (v0 / V1) — keep as label, name as title
    return { label: badge, title: trimmed };
  }

  if (MOSCOW_TOKEN.test(trimmed)) {
    return {
      label: normalizeMoscowLabel(trimmed),
      title: normalizeMoscowLabel(trimmed),
    };
  }

  return { label: `Phase ${index}`, title: trimmed || `Phase ${index}` };
};

/** Split storage HTML into heading / body chunks by h1–h3. */
const splitByHeadings = (html: string): Section[] => {
  const re = /<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const matches: {
    index: number;
    end: number;
    level: number;
    headingHtml: string;
  }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    matches.push({
      index: m.index,
      end: m.index + m[0].length,
      level: Number(m[1]),
      headingHtml: m[2],
    });
  }
  if (!matches.length) return [];

  return matches.map((heading, i) => {
    const next = matches[i + 1];
    return {
      level: heading.level,
      headingHtml: heading.headingHtml,
      bodyHtml: html.slice(heading.end, next?.index ?? html.length),
    };
  });
};

/**
 * Some Bridge pages use bold paragraphs instead of real headings.
 * Treat short <p><strong>…</strong></p> as section breaks.
 */
const splitByStrongParagraphs = (html: string): Section[] => {
  const re =
    /<p\b[^>]*>\s*(?:<strong>|<b>)([\s\S]*?)(?:<\/strong>|<\/b>)\s*<\/p>/gi;
  const matches: { index: number; end: number; headingHtml: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const text = decodeEntities(m[1]);
    if (!text || text.length > 80) continue;
    matches.push({
      index: m.index,
      end: m.index + m[0].length,
      headingHtml: m[1],
    });
  }
  if (matches.length < 2) return [];

  return matches.map((heading, i) => {
    const next = matches[i + 1];
    return {
      level: 2,
      headingHtml: heading.headingHtml,
      bodyHtml: html.slice(heading.end, next?.index ?? html.length),
    };
  });
};

const countListItems = (html: string): number =>
  (html.match(/<li\b[^>]*>/gi) ?? []).length;

const countTableRows = (html: string): number => {
  const rows = html.match(/<tr\b[^>]*>/gi)?.length ?? 0;
  if (rows <= 1) return 0;
  return rows - 1;
};

const firstParagraph = (html: string): string => {
  const p = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  if (!p) return "";
  const text = decodeEntities(p[1]);
  return text.length >= 8 ? text : "";
};

const sectionMilestones = (bodyHtml: string): number => {
  const lists = countListItems(bodyHtml);
  if (lists) return lists;
  const rows = countTableRows(bodyHtml);
  if (rows) return rows;
  return (bodyHtml.match(/<h[1-6]\b[^>]*>/gi) ?? []).length;
};

const sectionBody = (bodyHtml: string, milestones: number): string => {
  const para = firstParagraph(bodyHtml);
  if (para) return para.length > 160 ? `${para.slice(0, 157)}…` : para;
  if (milestones > 0) {
    return `${milestones} milestone${milestones === 1 ? "" : "s"}`;
  }
  return "Open in Confluence for detail";
};

const toCard = (
  label: string,
  title: string,
  bodyHtml: string
): { card: RoadmapPhaseCard; milestones: number } => {
  const milestones = sectionMilestones(bodyHtml);
  return {
    milestones,
    card: {
      label,
      title: title || label,
      body: sectionBody(bodyHtml, milestones),
    },
  };
};

const sectionPlainTitle = (headingHtml: string): string =>
  cleanHeadingHtml(headingHtml).text.trim();

/** Build cards from refined headings (status macros + MoSCoW suffixes). */
const cardsFromSections = (
  sections: Section[]
): { cards: RoadmapPhaseCard[]; milestones: number } => {
  const usable = sections.filter((s) => {
    const t = sectionPlainTitle(s.headingHtml);
    return t && !SKIP_SECTION_TITLES.test(t);
  });
  if (!usable.length) return { cards: [], milestones: 0 };

  // Prefer the dominant heading level (usually h2)
  const levelCounts = new Map<number, number>();
  for (const s of usable) {
    levelCounts.set(s.level, (levelCounts.get(s.level) ?? 0) + 1);
  }
  let preferredLevel = usable[0].level;
  let best = 0;
  for (const [level, count] of levelCounts) {
    if (count > best) {
      best = count;
      preferredLevel = level;
    }
  }

  const atLevel = usable.filter((s) => s.level === preferredLevel);
  const cards: RoadmapPhaseCard[] = [];
  let milestones = 0;
  let i = 0;

  for (const section of atLevel) {
    const mCount = sectionMilestones(section.bodyHtml);
    const para = firstParagraph(section.bodyHtml);
    if (!mCount && !para && atLevel.length > 1) continue;

    i += 1;
    const { label, title } = refineHeading(section.headingHtml, i);
    const built = toCard(label, title, section.bodyHtml);
    cards.push(built.card);
    milestones += built.milestones;
  }

  return { cards, milestones };
};

/**
 * Transform Confluence roadmap storage HTML into phase cards + milestone tally.
 */
export const parseRoadmapFromConfluence = (
  storageHtml: string
): RoadmapFromConfluence => {
  const html = storageHtml.trim();
  if (!html) {
    return { phases: [], milestoneCount: 0 };
  }

  let sections = splitByHeadings(html);
  if (!sections.length) {
    sections = splitByStrongParagraphs(html);
  }

  const chosen = cardsFromSections(sections);

  if (chosen.cards.length > 0) {
    return {
      phases: chosen.cards,
      milestoneCount: chosen.milestones,
      blurb: DEFAULT_BLURB,
    };
  }

  const excerpt =
    firstParagraph(html) ||
    decodeEntities(html.replace(/<[^>]+>/g, " ")).slice(0, 180);

  return {
    phases: [],
    milestoneCount: 0,
    excerpt: excerpt || undefined,
    blurb: DEGRADE_BLURB,
  };
};
