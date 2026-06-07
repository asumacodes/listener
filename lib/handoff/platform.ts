export type HandoffPlatform = "standard" | "iosSafari" | "granted";

export const detectHandoffPlatform = (): HandoffPlatform => {
  if (typeof window === "undefined") return "standard";

  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|Chrome/.test(ua);
  const standalone =
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone;

  if (isIos && isSafari && !standalone) return "iosSafari";
  return "standard";
};

export const requestPipelineNotification = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
};
