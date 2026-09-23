"use client";

import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { useEffect, useRef, useState } from "react";

const DURATION_MS = 700;

/**
 * Tweens a displayed integer toward `value`.
 *
 * The first real value is adopted without a tween — a pill that counted up
 * from zero on every mount would turn an ordinary page load into an event.
 * Only later changes animate, which is exactly when the number means something
 * happened (a grant landing, a run consuming an idea).
 *
 * `ready` stays false while the source is still loading.
 */
export const useAnimatedCount = (value: number, ready = true): number => {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  const primedRef = useRef(false);

  useEffect(() => {
    const snap = () => {
      displayRef.current = value;
      setDisplay(value);
    };

    if (!ready || reduced) {
      snap();
      return;
    }

    if (!primedRef.current) {
      primedRef.current = true;
      snap();
      return;
    }

    const from = displayRef.current;
    if (from === value) return;

    const startedAt = performance.now();
    let frame = requestAnimationFrame(function step(now: number) {
      const p = Math.min(1, (now - startedAt) / DURATION_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(from + (value - from) * eased);
      displayRef.current = next;
      setDisplay(next);
      if (p < 1) frame = requestAnimationFrame(step);
    });

    return () => cancelAnimationFrame(frame);
  }, [value, ready, reduced]);

  return display;
};

export default useAnimatedCount;
