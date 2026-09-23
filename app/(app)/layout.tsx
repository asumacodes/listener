import { DisplayCurrencyProvider } from "@/components/billing/DisplayCurrencyProvider";
import AppTabLayout from "@/components/nav/AppTabLayout";
import { getDisplayCurrency } from "@/lib/billing/currency.server";
import type { ReactNode } from "react";

type AppGroupLayoutProps = {
  children: ReactNode;
};

// Display currency is resolved from Vercel geo on the server so prices render
// in one currency on first paint. Display only — never sent to billing APIs.
const AppGroupLayout = async ({ children }: AppGroupLayoutProps) => (
  <DisplayCurrencyProvider currency={await getDisplayCurrency()}>
    <AppTabLayout>{children}</AppTabLayout>
  </DisplayCurrencyProvider>
);

export default AppGroupLayout;
