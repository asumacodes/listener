import DesktopPlanChooseScreen from "@/components/desktop/account/DesktopPlanChooseScreen";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ from?: string | string[] }> };

/** Analytics source only (plan_viewed) — never used for anything else. */
const DesktopPlanChoosePage = async ({ searchParams }: PageProps) => {
  const { from } = await searchParams;
  const source =
    (Array.isArray(from) ? from[0] : from) === "account" ? "account" : "other";
  return <DesktopPlanChooseScreen source={source} />;
};

export default DesktopPlanChoosePage;
