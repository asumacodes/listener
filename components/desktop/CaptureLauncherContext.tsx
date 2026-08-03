"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CaptureLauncherContextValue = {
  open: boolean;
  openCapture: () => void;
  closeCapture: () => void;
};

const CaptureLauncherContext =
  createContext<CaptureLauncherContextValue | null>(null);

export const CaptureLauncherProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const openCapture = useCallback(() => setOpen(true), []);
  const closeCapture = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, openCapture, closeCapture }),
    [open, openCapture, closeCapture]
  );
  return (
    <CaptureLauncherContext.Provider value={value}>
      {children}
    </CaptureLauncherContext.Provider>
  );
};

export const useCaptureLauncher = () => {
  const ctx = useContext(CaptureLauncherContext);
  if (!ctx) {
    throw new Error(
      "useCaptureLauncher must be used within CaptureLauncherProvider"
    );
  }
  return ctx;
};
