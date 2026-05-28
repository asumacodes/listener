"use client";

import { useSyncExternalStore } from "react";

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
};

const getOnline = () => navigator.onLine;

const getServerSnapshot = () => true;

export const useOnlineStatus = () =>
  useSyncExternalStore(subscribe, getOnline, getServerSnapshot);

export default useOnlineStatus;
