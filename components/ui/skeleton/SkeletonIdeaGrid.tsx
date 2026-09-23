import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard";
import SkeletonRegion from "@/components/ui/skeleton/SkeletonRegion";
import { copy } from "@/lib/design/copy";

const CARD = "flex min-h-[220px] flex-col p-[22px]";

/** Mirrors IdeaCard — status line, two-line title, description, footer. */
const SkeletonIdeaCard = () => (
  <SkeletonCard className={CARD}>
    <SkeletonBar className="h-2.5 w-24" />
    <SkeletonBar className="mt-4 h-5 w-[85%]" />
    <SkeletonBar className="mt-2 h-5 w-[55%]" />
    <SkeletonBar className="mt-3 h-3 w-full" />
    <SkeletonBar className="mt-1.5 h-3 w-[70%]" />
    <SkeletonBar className="mt-auto h-2.5 w-28" />
  </SkeletonCard>
);

/** Mirrors the "Have a new idea?" launcher in the first grid cell. */
const SkeletonLauncherCard = () => (
  <SkeletonCard className={CARD}>
    <SkeletonBar className="h-10 w-10 rounded-full" />
    <SkeletonBar className="mt-auto h-6 w-[70%]" />
    <SkeletonBar className="mt-2.5 h-3 w-28" />
  </SkeletonCard>
);

/** Desktop home grid while ideas load — launcher slot + 7 idea cards. */
const SkeletonIdeaGrid = () => (
  <SkeletonRegion label={copy.loading.ideas} className="grid grid-cols-4 gap-5">
    <SkeletonLauncherCard />
    {Array.from({ length: 7 }, (_, i) => (
      <SkeletonIdeaCard key={i} />
    ))}
  </SkeletonRegion>
);

/** Project tab strip placeholder (same row as the tabs). */
export const SkeletonProjectTabs = () => (
  <div className="flex gap-[22px] pb-2" aria-hidden>
    <SkeletonBar className="h-3 w-24" />
    <SkeletonBar className="h-3 w-20" />
    <SkeletonBar className="h-3 w-28" />
  </div>
);

export default SkeletonIdeaGrid;
