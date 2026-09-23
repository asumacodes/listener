import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ intent?: string | string[] }>;
};

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * Legacy return landing. Dodo sessions opened before /checkout/return shipped
 * still redirect here — forward them, keeping the intent as the action hint.
 */
const CheckoutSuccessPage = async ({ searchParams }: PageProps) => {
  const query = await searchParams;
  const intent = firstParam(query.intent);
  redirect(
    `/checkout/return${intent ? `?action=${encodeURIComponent(intent)}` : ""}`
  );
};

export default CheckoutSuccessPage;
