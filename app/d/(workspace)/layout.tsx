import { DisplayCurrencyProvider } from "@/components/billing/DisplayCurrencyProvider";
import DesktopShell from "@/components/desktop/DesktopShell";
import { getDisplayCurrency } from "@/lib/billing/currency.server";
import type { ReactNode } from "react";

type DesktopWorkspaceLayoutProps = {
  children: ReactNode;
};

// Display currency from Vercel geo, resolved server-side (no $ → ₹ flash).
// Display only — never sent to billing APIs.
const DesktopWorkspaceLayout = async ({
  children,
}: DesktopWorkspaceLayoutProps) => (
  <DisplayCurrencyProvider currency={await getDisplayCurrency()}>
    <DesktopShell>{children}</DesktopShell>
  </DisplayCurrencyProvider>
);

export default DesktopWorkspaceLayout;
