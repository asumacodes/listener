/** Desktop surface breakpoint — multi-region workspace at ≥1024px (lg). */
export const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

export const SURFACE_COOKIE = "listener-surface";
export const SURFACE_HEADER = "x-listener-surface";

export type ListenerSurface = "desktop" | "mobile";

export const DESKTOP_REWRITE_PREFIX = "/d";

/** Paths that stay on the shared/mobile tree (no desktop rewrite). */
export const isSurfaceExemptPath = (pathname: string): boolean =>
  pathname.startsWith("/login") ||
  pathname.startsWith("/auth") ||
  pathname.startsWith("/onboarding") ||
  pathname.startsWith("/api/") ||
  pathname.startsWith("/debug/") ||
  pathname.startsWith("/monitoring") ||
  pathname.startsWith("/d/") ||
  pathname === "/d";

const MOBILE_UA =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export const resolveListenerSurface = (input: {
  cookieValue: string | undefined;
  secChUaMobile: string | null;
  userAgent: string | null;
}): ListenerSurface => {
  if (input.cookieValue === "desktop" || input.cookieValue === "mobile") {
    return input.cookieValue;
  }
  if (input.secChUaMobile === "?0") return "desktop";
  if (input.secChUaMobile === "?1") return "mobile";
  if (input.userAgent && MOBILE_UA.test(input.userAgent)) return "mobile";
  return "desktop";
};

/** Map a public path to the internal desktop tree path. */
export const toDesktopInternalPath = (pathname: string): string => {
  if (pathname === "/" || pathname === "") return DESKTOP_REWRITE_PREFIX;
  if (pathname.startsWith(DESKTOP_REWRITE_PREFIX)) return pathname;
  return `${DESKTOP_REWRITE_PREFIX}${pathname}`;
};

/** Strip internal `/d` prefix for cookie-forced mobile fallback. */
export const toMobilePublicPath = (pathname: string): string => {
  if (
    pathname === DESKTOP_REWRITE_PREFIX ||
    pathname === `${DESKTOP_REWRITE_PREFIX}/`
  ) {
    return "/";
  }
  if (pathname.startsWith(`${DESKTOP_REWRITE_PREFIX}/`)) {
    return pathname.slice(DESKTOP_REWRITE_PREFIX.length);
  }
  return pathname;
};
