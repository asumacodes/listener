const isStandalonePwa = () => {
  if (typeof window === "undefined") return false;
  const displayStandalone = window.matchMedia(
    "(display-mode: standalone)"
  ).matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    );
  return displayStandalone || iosStandalone;
};

/** External links: `target=_blank` often no-ops in iOS/Android standalone PWAs. */
export const openExternal = (href: string) => {
  if (isStandalonePwa()) {
    const opened = window.open(href, "_blank", "noopener,noreferrer");
    if (!opened) window.location.assign(href);
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
};
