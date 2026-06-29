// URL builders for the Jira / Confluence / Roadmap launchpad link-outs.

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const atlassianSiteBase = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return null;
  }
};

// Jira: issue navigator for the project. Software board URLs need a board id
// (e.g. …/c/projects/SOLOB57/boards/353/backlog) which run_results does not
// capture — generic /boards paths can redirect to /not-found.
export const buildJiraProjectUrl = (
  projectKey: string | null | undefined,
  siteUrl?: string | null
): string | null => {
  if (!projectKey) return null;
  const base = atlassianSiteBase(siteUrl);
  if (!base) return null;
  return `${base}/browse/${projectKey}`;
};

export const buildConfluenceSpaceUrl = (
  spaceUrl: string | null | undefined
): string | null => {
  if (spaceUrl) return spaceUrl;
  return null;
};

// Roadmap: deep-link to the "05 - Roadmap" page inside the space, so the card
// is distinct from the whole-space Confluence card.
export const buildRoadmapPageUrl = (
  spaceUrl: string | null | undefined,
  spaceKey: string | null | undefined,
  pageId: string | null | undefined
): string | null => {
  if (!spaceKey || !pageId) return null;
  const base = atlassianSiteBase(spaceUrl);
  if (!base) return null;
  return `${trimTrailingSlash(base)}/wiki/spaces/${spaceKey}/pages/${pageId}`;
};
