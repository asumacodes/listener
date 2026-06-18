// lib/integrations/atlassian/token-broker.ts
//
// Returns a guaranteed-valid Atlassian access token for a user, refreshing if
// expired. Handles Atlassian's refresh-token ROTATION: each refresh returns a
// new refresh token that invalidates the old one, so we persist both back
// (encrypted) before returning. SERVER-ONLY.

import {
  deleteConnection,
  getConnection,
  upsertConnection,
} from "@/lib/integrations/atlassian/connection-store";
import { refreshTokens } from "@/lib/integrations/atlassian/oauth";

// Refresh slightly early so a token that's about to expire mid-request doesn't
// fail on the consumer side.
const EXPIRY_SKEW_MS = 60_000; // 1 min

export type BrokerResult =
  | {
      status: "ok";
      accessToken: string;
      cloudId: string;
      siteUrl: string;
    }
  | { status: "no_connection" }
  | { status: "connection_invalid" };

export async function getValidAtlassianToken(
  userId: string
): Promise<BrokerResult> {
  const conn = await getConnection(userId);
  if (!conn) return { status: "no_connection" };

  const expiresMs = new Date(conn.accessExpiresAt).getTime();
  const stillValid =
    Number.isFinite(expiresMs) && Date.now() < expiresMs - EXPIRY_SKEW_MS;

  if (stillValid) {
    return {
      status: "ok",
      accessToken: conn.accessToken,
      cloudId: conn.cloudId,
      siteUrl: conn.siteUrl,
    };
  }

  // Access token expired (or nearly) -> refresh.
  const clientId = process.env.ATLASSIAN_CLIENT_ID;
  const clientSecret = process.env.ATLASSIAN_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    // Misconfiguration, not a dead connection - surface as invalid so the
    // Bridge degrades rather than hard-erroring a whole run.
    return { status: "connection_invalid" };
  }

  let refreshed;
  try {
    refreshed = await refreshTokens({
      clientId,
      clientSecret,
      refreshToken: conn.refreshToken,
    });
  } catch {
    // Refresh failed - almost always a dead/revoked refresh token. Per the
    // hard-delete model, remove the connection so Settings shows "reconnect".
    await deleteConnection(userId);
    return { status: "connection_invalid" };
  }

  // ROTATION: persist the new access AND new refresh token immediately.
  const newAccessExpiresAt = new Date(
    Date.now() + refreshed.expires_in * 1000
  ).toISOString();
  await upsertConnection({
    userId,
    cloudId: conn.cloudId,
    siteUrl: conn.siteUrl,
    scopes: refreshed.scope || conn.scopes,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token, // the NEW rotated one
    accessExpiresAt: newAccessExpiresAt,
  });

  return {
    status: "ok",
    accessToken: refreshed.access_token,
    cloudId: conn.cloudId,
    siteUrl: conn.siteUrl,
  };
}
