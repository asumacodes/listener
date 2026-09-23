import { DisplayCurrencyProvider } from "@/components/billing/DisplayCurrencyProvider";
import { getDisplayCurrency } from "@/lib/billing/currency.server";
import type { ReactNode } from "react";

// /checkout, /checkout/review and /checkout/return show prices before the Dodo
// redirect. Display only: the currency never reaches /api/billing/* and Dodo
// charges its own localized amount.
const CheckoutLayout = async ({ children }: { children: ReactNode }) => (
  <DisplayCurrencyProvider currency={await getDisplayCurrency()}>
    {children}
  </DisplayCurrencyProvider>
);

export default CheckoutLayout;
