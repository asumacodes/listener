import CheckoutReviewScreen from "@/screens/CheckoutReviewScreen";
import {
  parsePaidCheckoutTier,
  parseReviewAction,
} from "@/lib/billing/checkoutTier";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    tier?: string | string[];
    action?: string | string[];
  }>;
};

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const CheckoutReviewPage = async ({ searchParams }: PageProps) => {
  const query = await searchParams;
  const tier = parsePaidCheckoutTier(firstParam(query.tier));
  if (!tier) redirect("/account/plan");
  const action = parseReviewAction(firstParam(query.action)) ?? "subscribe";
  return <CheckoutReviewScreen tier={tier} action={action} />;
};

export default CheckoutReviewPage;
