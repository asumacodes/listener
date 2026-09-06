import crypto from "crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// PINNED hash contract: sha256, lowercase hex, 64 chars. n8n (iii) MUST match
// these exact bytes: encode(digest(secret,'sha256'),'hex'). One function only.
export const hashShipToken = (secret: string): string =>
  crypto.createHash("sha256").update(secret).digest("hex");

// Service-role client, copied from app/api/push/dispatch/route.ts (no admin.ts).
export const createShipAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase service role is not configured");
  }
  return createServiceClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

export type ConsumeResult = { runId: string | null; alreadyUsed: boolean };

type ConsumeRow = {
  run_id?: string | null;
  already_used?: boolean | null;
};

export const consumeShipToken = async (
  secret: string,
  shipped: boolean
): Promise<ConsumeResult> => {
  const supabase = createShipAdminClient();
  const { data, error } = await supabase.rpc("consume_ship_followup_token", {
    p_token_hash: hashShipToken(secret),
    p_shipped: shipped,
  });
  if (error) throw error;
  const row = (Array.isArray(data) ? data[0] : data) as ConsumeRow | undefined;
  return {
    runId: row?.run_id ?? null,
    alreadyUsed: row?.already_used ?? false,
  };
};
