import {
  currencyForCountry,
  type DisplayCurrency,
} from "@/lib/billing/currency";
import { headers } from "next/headers";

/**
 * Vercel's edge geolocation, as the request header its network sets (the same
 * value `@vercel/functions` geolocation() reads). `request.geo` no longer
 * exists on NextRequest since Next 15. Absent locally, on geo failure, or for
 * non-Vercel hosts → USD.
 */
const COUNTRY_HEADER = "x-vercel-ip-country";

/**
 * Server-only: resolve the display currency for this request so the right
 * price renders on first paint (no $ → ₹ flash). DISPLAY ONLY — never forward
 * this to a billing request.
 */
export const getDisplayCurrency = async (): Promise<DisplayCurrency> => {
  const requestHeaders = await headers();
  return currencyForCountry(requestHeaders.get(COUNTRY_HEADER));
};
