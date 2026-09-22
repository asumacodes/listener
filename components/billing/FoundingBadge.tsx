import { StatusBadge } from "@/components/ui/Badge";
import { copy } from "@/lib/design/copy";

/** Founding member pill — gold, dotted, only while the 12-month window is open. */
const FoundingBadge = ({ className = "" }: { className?: string }) => (
  <StatusBadge variant="ready" className={`text-gold-deep ${className}`}>
    {copy.plan.founding}
  </StatusBadge>
);

export default FoundingBadge;
