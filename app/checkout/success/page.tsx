import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    intent?: string | string[];
    status?: string | string[];
  }>;
};

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * Legacy return landing. Dodo sessions opened before /checkout/return shipped
 * still redirect here — forward them, keeping the intent as the action hint
 * and Dodo's status as a veto.
 */
const CheckoutSuccessPage = async ({ searchParams }: PageProps) => {
  const query = await searchParams;
  const params = new URLSearchParams();
  const intent = firstParam(query.intent);
  const status = firstParam(query.status);
  if (intent) params.set("action", intent);
  // Keep Dodo's status so a failure still vetoes success after the hop.
  if (status) params.set("status", status);
  const qs = params.toString();
  redirect(`/checkout/return${qs ? `?${qs}` : ""}`);
};

export default CheckoutSuccessPage;
