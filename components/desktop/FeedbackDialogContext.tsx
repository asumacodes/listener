"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FeedbackDialogContextValue = {
  open: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
};

const FeedbackDialogContext = createContext<FeedbackDialogContextValue | null>(
  null
);

export const FeedbackDialogProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const openFeedback = useCallback(() => setOpen(true), []);
  const closeFeedback = useCallback(() => setOpen(false), []);
  const value = useMemo(
    () => ({ open, openFeedback, closeFeedback }),
    [open, openFeedback, closeFeedback]
  );

  return (
    <FeedbackDialogContext.Provider value={value}>
      {children}
    </FeedbackDialogContext.Provider>
  );
};

export const useFeedbackDialog = () => {
  const ctx = useContext(FeedbackDialogContext);
  if (!ctx) {
    throw new Error(
      "useFeedbackDialog must be used within a FeedbackDialogProvider"
    );
  }
  return ctx;
};
