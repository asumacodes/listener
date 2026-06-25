// lib/integrations/atlassian/oauth.ts
//
// Atlassian OAuth 2.0 (3LO) flow logic. Pure-ish: builds URLs and calls
// Atlassian's token + resource endpoints. No DB, no cookies, no secrets read
// here - the route handler supplies clientId/secret/redirectUri. SERVER-ONLY.

const AUTHORIZE_URL = "https://auth.atlassian.com/authorize";
const TOKEN_URL = "https://auth.atlassian.com/oauth/token";
const RESOURCES_URL =
  "https://api.atlassian.com/oauth/token/accessible-resources";

// The exact granular scopes registered on the app, plus offline_access (which
// is NOT in the console picker - it must be requested here to get a refresh
// token). Space-separated in the authorize URL.
export const ATLASSIAN_SCOPES = [
  // granular Confluence (v2 pages)
  "read:page:confluence",
  "write:page:confluence",
  "read:space:confluence",
  "write:space:confluence",
  // granular Jira
  "write:issue:jira",
  "read:issue:jira",
  "read:project:jira",
  "write:project:jira",
  "read:jira-user",
  "read:me",
  // classic Confluence (v1 space create + content)
  "write:confluence-space",
  "write:confluence-content",
  "read:confluence-space.summary",
  "read:confluence-content.all",
  // classic Jira (v3 issue create)
  "write:jira-work",
  "read:jira-work",
  "offline_access",
].join(" ");

export function buildAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const u = new URL(AUTHORIZE_URL);
  u.searchParams.set("audience", "api.atlassian.com");
  u.searchParams.set("client_id", params.clientId);
  u.searchParams.set("scope", ATLASSIAN_SCOPES);
  u.searchParams.set("redirect_uri", params.redirectUri);
  u.searchParams.set("state", params.state);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("prompt", "consent");
  return u.toString();
}

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  scope: string;
  token_type: string;
};

export async function exchangeCodeForTokens(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: params.clientId,
      client_secret: params.clientSecret,
      code: params.code,
      redirect_uri: params.redirectUri,
    }),
  });
  if (!res.ok) {
    // Do NOT log the body - may echo the code. Status only.
    throw new Error(`token_exchange_failed:${res.status}`);
  }
  return (await res.json()) as TokenResponse;
}

export async function refreshTokens(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      client_id: params.clientId,
      client_secret: params.clientSecret,
      refresh_token: params.refreshToken,
    }),
  });
  if (!res.ok) {
    throw new Error(`token_refresh_failed:${res.status}`);
  }
  return (await res.json()) as TokenResponse;
}

export type AccessibleResource = {
  id: string; // this is the cloudId
  url: string; // the site URL, e.g. https://their-site.atlassian.net
  name: string;
  scopes: string[];
};

export async function fetchAccessibleResources(
  accessToken: string
): Promise<AccessibleResource[]> {
  const res = await fetch(RESOURCES_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`accessible_resources_failed:${res.status}`);
  }
  return (await res.json()) as AccessibleResource[];
}
