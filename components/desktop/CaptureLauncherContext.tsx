"use client";

import { trackLauncherOpened } from "@/lib/analytics/events";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CaptureOpenOptions = {
  initialText?: string;
  startIn?: "typed" | "idle";
};

type CaptureLauncherContextValue = {
  open: boolean;
  initialText: string;
  startIn: "typed" | "idle";
  openCapture: (opts?: CaptureOpenOptions) => void;
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
  const [initialText, setInitialText] = useState("");
  const [startIn, setStartIn] = useState<"typed" | "idle">("idle");

  const openCapture = useCallback((opts?: CaptureOpenOptions) => {
    setInitialText(opts?.initialText ?? "");
    setStartIn(opts?.startIn ?? "idle");
    setOpen(true);
    trackLauncherOpened();
  }, []);

  const closeCapture = useCallback(() => {
    setOpen(false);
    setInitialText("");
    setStartIn("idle");
  }, []);

  const value = useMemo(
    () => ({ open, initialText, startIn, openCapture, closeCapture }),
    [open, initialText, startIn, openCapture, closeCapture]
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
