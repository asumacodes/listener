import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard";
import SkeletonRegion from "@/components/ui/skeleton/SkeletonRegion";
import { copy } from "@/lib/design/copy";

/** Mirrors PlanTierCards while the balance loads (so no tier guesses "Subscribe"). */
const SkeletonTierCards = ({ variant }: { variant: "desktop" | "mobile" }) => (
  <SkeletonRegion
    label={copy.loading.plan}
    className={
      variant === "desktop" ? "grid grid-cols-3 gap-5" : "flex flex-col gap-3"
    }
  >
    {[0, 1, 2].map((i) => (
      <SkeletonCard
        key={i}
        className={`flex flex-col gap-4 ${
          variant === "desktop" ? "min-h-[340px] p-6" : "p-[18px]"
        }`}
      >
        <SkeletonBar className="h-6 w-24" />
        <SkeletonBar
          className={variant === "desktop" ? "h-14 w-28" : "h-10 w-24"}
        />
        <SkeletonBar className="h-3 w-40" />
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <SkeletonBar className="h-6 w-16" />
          <SkeletonBar className="h-10 w-32 rounded-full" />
        </div>
      </SkeletonCard>
    ))}
  </SkeletonRegion>
);

export default SkeletonTierCards;
