import { redirect } from "next/navigation";

/**
 * Mobile picks a plan in the Choose-a-plan sheet on /account/plan; the
 * full-screen picker at this URL is desktop-only (served from app/d).
 */
const PlanChoosePage = () => {
  redirect("/account/plan");
};

export default PlanChoosePage;
