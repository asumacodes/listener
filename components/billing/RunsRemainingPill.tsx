"use client";

import { useEntitlementBalance } from "@/hooks/useEntitlementBalance";

type Props = { variant?: "chip" | "rail" };

/**
 * KAN-82 entitlement indicator. Effective runs remaining (free+sub+purchased).
 * - bypass: hidden (operator override, not a count).
 * - loading / null / malformed: hidden (never a fake 0).
 * - valid 0: shown as "0 ideas left" (honest empty).
 * No gold/error tokens, no purchase CTA (KAN-65 owns purchase flows).
 */
export function RunsRemainingPill({ variant = "chip" }: Props) {
  const { balance, loading } = useEntitlementBalance();
  if (loading || !balance || balance.bypass) return null;

  const n = balance.effectiveRemaining;
  const noun = n === 1 ? "idea" : "ideas";
  const phrase = `${n} ${noun} left`;

  if (variant === "rail") {
    return (
      <div
        className="flex flex-col items-center gap-0.5 py-3"
        title={phrase}
        aria-label={phrase}
      >
        <span className="text-sm font-medium tabular-nums text-text">{n}</span>
        <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-muted">
          {noun}
        </span>
      </div>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-secondary shadow-card"
      title={phrase}
      aria-label={phrase}
    >
      <span className="font-medium tabular-nums text-text">{n}</span>
      <span>{noun} left</span>
    </div>
  );
}
