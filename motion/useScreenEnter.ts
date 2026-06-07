"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { durations } from "@/lib/gsap/durations";
import { RefObject } from "react";

type UseScreenEnterOptions = {
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

/** Fade-in + 8px rise per Design System §05. */
export const useScreenEnter = ({
  containerRef,
  enabled = true,
}: UseScreenEnterOptions) => {
  useGSAP(
    () => {
      if (!enabled || !containerRef.current) return;
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: durations.screenEnter,
          ease: "power2.out",
        }
      );
    },
    { dependencies: [enabled], scope: containerRef, revertOnUpdate: true }
  );
};
