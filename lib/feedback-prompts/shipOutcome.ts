import { createClient } from "@/lib/supabase/client";

export type ShipOutcomeState = {
  ready: boolean;
  already_done: boolean;
  shipped: boolean;
};

const ABSENT: ShipOutcomeState = {
  ready: false,
  already_done: false,
  shipped: false,
};

export const getShipOutcomeState = async (
  runId: string
): Promise<ShipOutcomeState> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_ship_outcome_state", {
    p_run_id: runId,
  });
  if (error || !data?.[0]) return ABSENT;
  const row = data[0];
  return {
    ready: row.ready,
    already_done: row.already_done,
    shipped: row.shipped,
  };
};

export type RecordShipOutcomeResult =
  | { ok: true; id: string }
  | { ok: false; reason: "incomplete" | "failed" };

export const recordShipOutcome = async ({
  runId,
  shippedWhat,
  liveProductUrl,
  publicConsent,
}: {
  runId: string;
  shippedWhat: string;
  liveProductUrl?: string | null;
  publicConsent: boolean;
}): Promise<RecordShipOutcomeResult> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("record_ship_outcome", {
    p_run_id: runId,
    p_shipped_what: shippedWhat,
    p_live_product_url: liveProductUrl ?? null,
    p_public_consent: publicConsent,
  });
  if (error || !data) {
    if (error?.code === "P0001") return { ok: false, reason: "incomplete" };
    return { ok: false, reason: "failed" };
  }
  return { ok: true, id: data };
};
