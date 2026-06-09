//
// Shapes of the run_results jsonb columns, mirroring the Bridge's Parse-node
// output exactly (System Architecture page, run_results table). Field names are
// the real agent output — do not transform. All columns are nullable: a column
// is absent until its stage completes (ADR-021 incremental write), and an agent
// can legitimately produce an empty payload (drives the empty-card state).

export type PrdResult = {
  productName?: string;
  oneLiner?: string;
  problem?: string;
  targetUser?: string;
  features?: {
    must_have?: string[];
    should_have?: string[];
    could_have?: string[];
    wont_have?: string[];
  };
  successMetrics?: string[];
  openQuestions?: string[];
};

export type CompetitorEntry = {
  name?: string;
  url?: string;
  positioning?: string;
  keyFeatures?: string[];
  pricingModel?: string;
  strengths?: string[];
  weaknesses?: string[];
  directOverlap?: string;
};

export type CompetitorsResult = {
  competitors?: CompetitorEntry[];
};

export type BrandResult = {
  brandName?: string;
  nameNotes?: string[];
  tagline?: string;
  brandValues?: string[];
  colorPalette?: Record<string, string | string[]>;
  typography?: string | Record<string, string>;
  logoDirection?: string;
  logoPrompt?: string;
  iconographyStyle?: string;
  moodboardPrompt?: string;
};

export type EngineeringResult = {
  hld?: { overview?: string; components?: string; dataFlow?: string };
  dataModels?: unknown[];
  schemaSql?: string;
  schemaTypescript?: string;
  techStack?: string | Record<string, unknown>;
  engineeringTasks?: string[];
  openEngineeringQuestions?: string[];
};

export type JiraResult = {
  success?: boolean;
  projectKey?: string;
  projectName?: string;
  epicsCreated?: { key?: string; title?: string }[];
  storiesCreated?: {
    key?: string;
    epic?: string;
    title?: string;
    phase?: string;
  }[];
};

export type ConfluencePage = { title?: string; id?: string };

export type ConfluenceResult = {
  success?: boolean;
  spaceKey?: string;
  homepageId?: string;
  pagesCreated?: ConfluencePage[];
  spaceUrl?: string;
};

// run_results row. Every column nullable per ADR-021 incremental fill.
// `transcript` added by ADR-021 (string column, not jsonb).
export type RunResults = {
  transcript: string | null;
  prd: PrdResult | null;
  competitors: CompetitorsResult | null;
  brand: BrandResult | null;
  engineering: EngineeringResult | null;
  jira: JiraResult | null;
  confluence: ConfluenceResult | null;
};
