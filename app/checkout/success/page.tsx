import CheckoutSuccessScreen from "@/screens/CheckoutSuccessScreen";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ intent?: string | string[] }>;
};

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const CheckoutSuccessPage = async ({ searchParams }: PageProps) => {
  const query = await searchParams;
  const intent = firstParam(query.intent) ?? null;
  return <CheckoutSuccessScreen intent={intent} />;
};

export default CheckoutSuccessPage;
