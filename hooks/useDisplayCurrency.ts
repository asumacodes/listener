"use client";

import { useDisplayCurrencyContext } from "@/components/billing/DisplayCurrencyProvider";

/** Which currency to DISPLAY prices in (INR for India, else USD). Display only. */
export const useDisplayCurrency = () => useDisplayCurrencyContext();

export default useDisplayCurrency;
