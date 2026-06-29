//
// Shapes of the run_results jsonb columns, mirroring the Bridge's real Parse-node
// output (verified against a live SoloBox run). Field names are the real agent
// output — do not transform. All fields optional: a column is absent until its
// stage completes (ADR-021), and an agent can produce a partial/empty payload.

export type PrdFeature = { title?: string; description?: string };

export type PrdSuccessMetric = { metric?: string; target?: string };

export type PrdResult = {
  productName?: string;
  oneLiner?: string;
  problem?: string;
  targetUser?: string;
  features?: {
    must_have?: PrdFeature[];
    should_have?: PrdFeature[];
    could_have?: PrdFeature[];
    wont_have?: PrdFeature[];
  };
  successMetrics?: PrdSuccessMetric[];
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
  marketSummary?: string;
  ourPositioning?: string;
  tableStakes?: string[];
  differentiationOpportunities?: string[];
};

export type BrandColorPalette = {
  primary?: string;
  secondary?: string;
  accent?: string;
  neutral?: string;
  semantic?: Record<string, string>;
};

export type BrandTypography = {
  heading?: string;
  body?: string;
  mono?: string;
};

export type BrandLogoDirection = {
  form?: string;
  style?: string;
  symbolConcept?: string;
  avoidances?: string[];
};

export type BrandResult = {
  brandName?: string;
  nameNotes?: string[];
  tagline?: string;
  brandValues?: string[];
  colorPalette?: BrandColorPalette;
  typography?: BrandTypography;
  logoDirection?: BrandLogoDirection;
  logoPrompt?: string;
  iconographyStyle?: string;
  moodboardPrompt?: string;
};

export type EngineeringComponent = { name?: string; responsibility?: string };

export type EngineeringTask = { title?: string; description?: string };

export type EngineeringResult = {
  hld?: {
    overview?: string;
    dataFlow?: string;
    components?: EngineeringComponent[];
  };
  dataModels?: unknown[];
  schemaSql?: string;
  schemaTypescript?: string;
  techStack?: Record<string, string>;
  engineeringTasks?: EngineeringTask[];
  openEngineeringQuestions?: string[];
};

export type JiraResult = {
  success?: boolean;
  siteUrl?: string;
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

export type RunResults = {
  transcript: string | null;
  prd: PrdResult | null;
  competitors: CompetitorsResult | null;
  brand: BrandResult | null;
  engineering: EngineeringResult | null;
  jira: JiraResult | null;
  confluence: ConfluenceResult | null;
};
