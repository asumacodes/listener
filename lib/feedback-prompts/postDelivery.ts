import { createClient } from "@/lib/supabase/client";
import type { FeedbackReaction } from "@/types/feedback-prompts";

export type PostDeliveryState = {
  exists: boolean;
  reaction: FeedbackReaction | null;
  dismissed: boolean;
  has_note: boolean;
};

const ABSENT: PostDeliveryState = {
  exists: false,
  reaction: null,
  dismissed: false,
  has_note: false,
};

const asReaction = (value: string | null): FeedbackReaction | null =>
  value === "up" || value === "down" ? value : null;

export const getPostDeliveryState = async (
  runId: string
): Promise<PostDeliveryState> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_post_delivery_state", {
    p_run_id: runId,
  });
  if (error || !data?.[0]) return ABSENT;
  const row = data[0];
  return {
    exists: row.exists,
    reaction: asReaction(row.reaction),
    dismissed: row.dismissed,
    has_note: row.has_note,
  };
};

export const recordPostDeliveryReaction = async ({
  runId,
  reaction,
  dismissed,
}: {
  runId: string;
  reaction?: FeedbackReaction | null;
  dismissed?: boolean;
}): Promise<string | null> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("record_post_delivery_reaction", {
    p_run_id: runId,
    p_reaction: reaction ?? null,
    p_dismissed: dismissed ?? false,
  });
  if (error || !data) return null;
  return data;
};

export const updatePostDeliveryNote = async ({
  runId,
  note,
}: {
  runId: string;
  note: string;
}): Promise<string | null> => {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("update_post_delivery_note", {
    p_run_id: runId,
    p_note: note,
  });
  if (error || !data) return null;
  return data;
};
