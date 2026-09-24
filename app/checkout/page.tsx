import CheckoutScreen from "@/screens/CheckoutScreen";
import {
  parseCheckoutTier,
  parsePaidCheckoutTier,
  reviewPath,
} from "@/lib/billing/checkoutTier";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    tier?: string | string[];
    /** Analytics source only (plan_viewed). */
    from?: string | string[];
  }>;
};

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const CheckoutPage = async ({ searchParams }: PageProps) => {
  const query = await searchParams;
  const raw = firstParam(query.tier);
  const tier = parseCheckoutTier(raw);
  if (!tier) redirect("/");

  // A named paid tier goes straight to the review step, which resolves
  // subscribe vs upgrade from the live balance.
  const paid = parsePaidCheckoutTier(raw);
  if (paid) redirect(reviewPath(paid, "subscribe"));

  // The picker here is reached from the quota nudge or the GTM/landing link.
  const source =
    firstParam(query.from) === "quota_nudge" ? "quota_nudge" : "gtm";
  return (
    <CheckoutScreen
      tier={tier === "payg" ? "payg" : "founding"}
      source={source}
    />
  );
};

export default CheckoutPage;
