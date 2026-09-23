import CheckoutScreen from "@/screens/CheckoutScreen";
import {
  parseCheckoutTier,
  parsePaidCheckoutTier,
  reviewPath,
} from "@/lib/billing/checkoutTier";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ tier?: string | string[] }>;
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

  return <CheckoutScreen tier={tier === "payg" ? "payg" : "founding"} />;
};

export default CheckoutPage;
