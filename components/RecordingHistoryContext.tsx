"use client";

import { createContext, useContext, type ReactNode } from "react";

type RecordingHistoryContextValue = {
  openHistory: () => void;
};

const RecordingHistoryContext =
  createContext<RecordingHistoryContextValue | null>(null);

export const RecordingHistoryProvider = ({
  openHistory,
  children,
}: {
  openHistory: () => void;
  children: ReactNode;
}) => (
  <RecordingHistoryContext.Provider value={{ openHistory }}>
    {children}
  </RecordingHistoryContext.Provider>
);

export const useOpenRecordingHistory = () => {
  const ctx = useContext(RecordingHistoryContext);
  return ctx?.openHistory ?? null;
};
