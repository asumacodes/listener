import CheckoutScreen from "@/screens/CheckoutScreen";
import { parseCheckoutTier } from "@/lib/billing/checkoutTier";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ tier?: string | string[] }>;
};

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const CheckoutPage = async ({ searchParams }: PageProps) => {
  const query = await searchParams;
  const tier = parseCheckoutTier(firstParam(query.tier));
  if (!tier) redirect("/");
  return <CheckoutScreen tier={tier} />;
};

export default CheckoutPage;
