import { createShipAdminClient } from "@/lib/feedback-prompts/shipToken";

type EntitlementDodoRow = { dodo_subscription_id: string | null };

/** Peek the Dodo sub id for an authenticated user. Table is service-role only. */
export const readDodoSubscriptionId = async (
  userId: string
): Promise<string | null> => {
  let admin;
  try {
    admin = createShipAdminClient();
  } catch {
    return null;
  }

  const { data, error } = await admin
    .from("user_entitlements" as never)
    .select("dodo_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return null;
  const subId = (data as EntitlementDodoRow | null)?.dodo_subscription_id;
  return typeof subId === "string" && subId.length > 0 ? subId : null;
};
