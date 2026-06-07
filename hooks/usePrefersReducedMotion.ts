"use client";

import { motionMediaQuery } from "@/lib/gsap/prefers-reduced-motion";
import { useSyncExternalStore } from "react";

const subscribe = (onStoreChange: () => void) => {
  const mq = window.matchMedia(motionMediaQuery);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
};

const getSnapshot = () => window.matchMedia(motionMediaQuery).matches;

const getServerSnapshot = () => false;

/** SSR-safe reduced-motion flag; updates when the user changes system preference. */
const usePrefersReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export default usePrefersReducedMotion;
