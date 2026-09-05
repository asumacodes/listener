/**
 * KAN-74 — active feedback capture. Sibling to KAN-60 feedback types.
 * Do NOT reuse FeedbackComposer types; different machine.
 *
 * `TestimonialPublic` is the contract KAN-63 imports from
 * `public.testimonial_public`. It does not redefine it.
 */

export type FeedbackPromptType =
  | "post_delivery"
  | "friction"
  | "ship_followup"
  | "founding_member";

export type FeedbackReaction = "up" | "down";

/** Full row (server/RPC-facing). */
export type FeedbackPromptRow = {
  id: string;
  user_id: string;
  prompt_type: FeedbackPromptType;
  run_id: string | null;
  delivered_idea_count: number | null;
  days_since_delivery: number | null;
  reaction: FeedbackReaction | null;
  response: string | null;
  shipped: boolean | null;
  shipped_what: string | null;
  live_product_url: string | null;
  voice_excerpt: string | null;
  artifacts_produced: string[] | null;
  display_name: string | null;
  public_consent: boolean | null;
  usable_as_testimonial: boolean;
  responded_at: string | null;
  dismissed: boolean;
  consent_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Canonical read model KAN-63 consumes verbatim from public.testimonial_public.
 * Non-null fields are guaranteed by the view WHERE, not by the table.
 */
export type TestimonialPublic = {
  id: string;
  voice_excerpt: string;
  artifacts_produced: string[];
  shipped_what: string;
  live_product_url: string | null;
  display_name: string;
  public_consent: true;
  usable_as_testimonial: true;
  run_id: string | null;
};
