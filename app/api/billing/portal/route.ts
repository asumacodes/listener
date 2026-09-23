import { NextResponse } from "next/server";
import { createCustomerPortalLink } from "@/lib/billing/customerPortal";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { ok: false, reason: "unauthenticated" },
      { status: 401 }
    );
  }

  const result = await createCustomerPortalLink({
    id: user.id,
    email: user.email,
  });

  if (!result.ok) {
    const status =
      result.reason === "customer_not_found"
        ? 404
        : result.reason === "dodo_not_configured"
          ? 501
          : 502;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
