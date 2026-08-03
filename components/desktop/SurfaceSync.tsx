"use client";

import {
  DESKTOP_MEDIA_QUERY,
  SURFACE_COOKIE,
  type ListenerSurface,
} from "@/lib/layout/surface";
import { useEffect, useRef } from "react";

const readSurfaceCookie = (): string | undefined =>
  document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SURFACE_COOKIE}=`))
    ?.split("=")[1];

const writeSurfaceCookie = (surface: ListenerSurface) => {
  document.cookie = `${SURFACE_COOKIE}=${surface};path=/;max-age=31536000;samesite=lax`;
};

/**
 * Keeps `listener-surface` aligned with real viewport width so the proxy
 * rewrite serves the correct tree.
 *
 * Must NOT use the hydrating `useIsDesktop` value — that starts as `false`
 * (SSR snapshot) and would flip the cookie to mobile on every desktop load,
 * causing an infinite reload loop.
 */
const SurfaceSync = () => {
  const reloading = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const reconcile = () => {
      if (reloading.current) return;
      const expected: ListenerSurface = mq.matches ? "desktop" : "mobile";
      const current = readSurfaceCookie();
      if (current === expected) return;
      writeSurfaceCookie(expected);
      // No cookie yet: proxy already chose via CH/UA — don't bounce the first paint.
      // Reload only when a stale cookie disagrees with the viewport (resize / mismatch).
      if (current == null) return;
      reloading.current = true;
      window.location.reload();
    };

    reconcile();
    mq.addEventListener("change", reconcile);
    return () => mq.removeEventListener("change", reconcile);
  }, []);

  return null;
};

export default SurfaceSync;
