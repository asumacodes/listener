// URL builders for the Jira / Confluence / Roadmap launchpad link-outs.

const ATLASSIAN_BASE = "https://hurrrphurr.atlassian.net";

// Jira: issue navigator for the project. Software board URLs need a board id
// (e.g. …/c/projects/SOLOB57/boards/353/backlog) which run_results does not
// capture — generic /boards paths redirect to /not-found on our tenant.
export const buildJiraProjectUrl = (
  projectKey: string | null | undefined
): string | null => {
  if (!projectKey) return null;
  return `${ATLASSIAN_BASE}/browse/${projectKey}`;
};

export const buildConfluenceSpaceUrl = (
  spaceUrl: string | null | undefined,
  spaceKey: string | null | undefined
): string | null => {
  if (spaceUrl) return spaceUrl;
  if (spaceKey) return `${ATLASSIAN_BASE}/wiki/spaces/${spaceKey}`;
  return null;
};

// Roadmap: deep-link to the "05 - Roadmap" page inside the space, so the card
// is distinct from the whole-space Confluence card.
export const buildRoadmapPageUrl = (
  spaceKey: string | null | undefined,
  pageId: string | null | undefined
): string | null => {
  if (!spaceKey || !pageId) return null;
  return `${ATLASSIAN_BASE}/wiki/spaces/${spaceKey}/pages/${pageId}`;
};
