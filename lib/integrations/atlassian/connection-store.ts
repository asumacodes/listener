// lib/integrations/atlassian/connection-store.ts
//
// Service-role read/write of atlassian_connections. SERVER-ONLY. Encrypts
// tokens before they touch the DB; decrypts on read. Inserts/updates use the
// service role (RLS has no client insert/update policy by design).

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { decryptToken, encryptToken } from "@/lib/crypto/atlassian-tokens";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("supabase_service_not_configured");
  return createAdminClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type DecryptedConnection = {
  userId: string;
  cloudId: string;
  siteUrl: string;
  scopes: string;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string; // ISO
};

export async function upsertConnection(input: {
  userId: string;
  cloudId: string;
  siteUrl: string;
  scopes: string;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string; // ISO
}): Promise<void> {
  const db = admin();
  const { error } = await db.from("atlassian_connections").upsert(
    {
      user_id: input.userId,
      cloud_id: input.cloudId,
      site_url: input.siteUrl,
      scopes: input.scopes,
      access_token_enc: encryptToken(input.accessToken),
      refresh_token_enc: encryptToken(input.refreshToken),
      access_expires_at: input.accessExpiresAt,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(`connection_upsert_failed:${error.message}`);
}

export async function getConnection(
  userId: string
): Promise<DecryptedConnection | null> {
  const db = admin();
  const { data, error } = await db
    .from("atlassian_connections")
    .select(
      "user_id, cloud_id, site_url, scopes, access_token_enc, refresh_token_enc, access_expires_at"
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`connection_read_failed:${error.message}`);
  if (!data) return null;
  return {
    userId: data.user_id,
    cloudId: data.cloud_id,
    siteUrl: data.site_url,
    scopes: data.scopes,
    accessToken: decryptToken(data.access_token_enc),
    refreshToken: decryptToken(data.refresh_token_enc),
    accessExpiresAt: data.access_expires_at,
  };
}

export async function deleteConnection(userId: string): Promise<void> {
  const db = admin();
  const { error } = await db
    .from("atlassian_connections")
    .delete()
    .eq("user_id", userId);
  if (error) throw new Error(`connection_delete_failed:${error.message}`);
}

/** Lightweight status for Settings - no token decryption. */
export async function getConnectionStatus(
  userId: string
): Promise<{ connected: boolean; siteUrl?: string }> {
  const db = admin();
  const { data, error } = await db
    .from("atlassian_connections")
    .select("site_url")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`connection_status_failed:${error.message}`);
  return data
    ? { connected: true, siteUrl: data.site_url }
    : { connected: false };
}
