import { ProfileProvider } from "@/components/profile/ProfileProvider";
import CheckoutReturnScreen from "@/screens/CheckoutReturnScreen";
import { parseReturnAction } from "@/lib/billing/checkoutReturn";
import { parsePaidCheckoutTier } from "@/lib/billing/checkoutTier";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    action?: string | string[];
    tier?: string | string[];
    /** Legacy /checkout/success param, still arriving from older links. */
    intent?: string | string[];
  }>;
};

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const CheckoutReturnPage = async ({ searchParams }: PageProps) => {
  const query = await searchParams;
  const action =
    parseReturnAction(firstParam(query.action)) ??
    parseReturnAction(firstParam(query.intent)) ??
    "subscribe";
  const tier = parsePaidCheckoutTier(firstParam(query.tier));

  return (
    <ProfileProvider>
      <CheckoutReturnScreen action={action} tier={tier} />
    </ProfileProvider>
  );
};

export default CheckoutReturnPage;
