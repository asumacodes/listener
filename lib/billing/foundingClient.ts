import type { FoundingCounter } from "@/lib/billing/foundingView";

/**
 * Browser read of the founding counter (display only). Throws on any failure
 * or malformed payload so the query lands in `error` and the UI shows the
 * static, numberless founding treatment.
 */
export const fetchFoundingCounter = async (
  signal?: AbortSignal
): Promise<FoundingCounter> => {
  const res = await fetch("/api/founding", { signal });
  if (!res.ok) throw new Error(`founding_counter_http_${res.status}`);
  const body = (await res.json()) as Record<string, unknown> | null;
  const claimed = body?.claimed;
  const cap = body?.cap;
  if (
    body?.ok !== true ||
    typeof claimed !== "number" ||
    typeof cap !== "number"
  ) {
    throw new Error("founding_counter_malformed");
  }
  return { claimed, cap };
};
