"use client";

import {
  DESKTOP_MEDIA_QUERY,
  SURFACE_COOKIE,
  type ListenerSurface,
} from "@/lib/layout/surface";
import { useCallback, useSyncExternalStore } from "react";

const subscribe = (onStoreChange: () => void) => {
  const mq = window.matchMedia(DESKTOP_MEDIA_QUERY);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
};

const getSnapshot = () => window.matchMedia(DESKTOP_MEDIA_QUERY).matches;

/** SSR default: assume mobile until client hydrates (safe for capture-primary PWA). */
const getServerSnapshot = () => false;

const writeSurfaceCookie = (surface: ListenerSurface) => {
  document.cookie = `${SURFACE_COOKIE}=${surface};path=/;max-age=31536000;samesite=lax`;
};

/**
 * True when viewport ≥ 1024px.
 * Prefer `SurfaceSync` for cookie/rewrite reconciliation — it reads matchMedia
 * directly and avoids the SSR `false` hydration flash.
 */
const useIsDesktop = (): {
  isDesktop: boolean;
  syncSurfaceCookie: () => void;
} => {
  const isDesktop = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const syncSurfaceCookie = useCallback(() => {
    const next: ListenerSurface = window.matchMedia(DESKTOP_MEDIA_QUERY).matches
      ? "desktop"
      : "mobile";
    writeSurfaceCookie(next);
    window.location.reload();
  }, []);

  return { isDesktop, syncSurfaceCookie };
};

export default useIsDesktop;
