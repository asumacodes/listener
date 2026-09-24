import { DisplayCurrencyProvider } from "@/components/billing/DisplayCurrencyProvider";
import { getDisplayCurrency } from "@/lib/billing/currency.server";
import type { ReactNode } from "react";

// /checkout, /checkout/review and /checkout/return show prices before the Dodo
// redirect. Display only: the currency never reaches /api/billing/* and Dodo
// charges its own localized amount.
// QueryClient lives on AppShell so this route shares the entitlement-balance cache.
const CheckoutLayout = async ({ children }: { children: ReactNode }) => (
  <DisplayCurrencyProvider currency={await getDisplayCurrency()}>
    {children}
  </DisplayCurrencyProvider>
);

export default CheckoutLayout;
