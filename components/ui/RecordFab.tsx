import { IconPlus } from "@/components/icons/ListenerIcons";
import { copy } from "@/lib/design/copy";
import Link from "next/link";

/** Gold + FAB — links to record (home). */
const RecordFab = () => (
  <Link
    href="/"
    aria-label={copy.projects.recordCta}
    className="absolute right-0 bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-white shadow-record transition hover:brightness-[1.03] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  >
    <IconPlus size={24} />
  </Link>
);

export default RecordFab;
