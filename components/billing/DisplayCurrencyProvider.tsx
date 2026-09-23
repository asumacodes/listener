"use client";

import type { DisplayCurrency } from "@/lib/billing/currency";
import { createContext, useContext, type ReactNode } from "react";

/** USD without a provider — the same fallback as unknown geo. */
const DisplayCurrencyContext = createContext<DisplayCurrency>("USD");

/**
 * Carries the server-resolved display currency (layout → getDisplayCurrency)
 * to client screens, so prices render in one currency on first paint.
 * Display only: nothing here is sent to billing APIs.
 */
export const DisplayCurrencyProvider = ({
  currency,
  children,
}: {
  currency: DisplayCurrency;
  children: ReactNode;
}) => (
  <DisplayCurrencyContext.Provider value={currency}>
    {children}
  </DisplayCurrencyContext.Provider>
);

export const useDisplayCurrencyContext = (): DisplayCurrency =>
  useContext(DisplayCurrencyContext);
