"use client";

import { getCaptureIllustration } from "@/components/illustrations/registry";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { loadLottieAnimation } from "@/lib/illustrations/client";
import type { CaptureIllustrationId } from "@/types/illustration";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type LottieIllustrationProps = {
  id: CaptureIllustrationId;
  className?: string;
  loop?: boolean;
};

/**
 * Lottie loader for capture-flow illustrations (Batch 1).
 * Pipeline loading states use SVG components in illustrations/pipeline/.
 */
const LottieIllustration = ({
  id,
  className = "",
  loop = true,
}: LottieIllustrationProps) => {
  const def = getCaptureIllustration(id);
  const reduceMotion = usePrefersReducedMotion();
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    if (!def.lottieSrc || reduceMotion) return;
    const controller = new AbortController();
    void loadLottieAnimation(def.lottieSrc, controller.signal)
      .then((data) => {
        setAnimationData(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setAnimationData(null);
      });
    return () => {
      controller.abort();
    };
  }, [def.lottieSrc, reduceMotion]);

  const showLottie = Boolean(def.lottieSrc && animationData && !reduceMotion);

  return (
    <div
      className={`relative flex w-full items-center justify-center ${className}`}
      style={{ aspectRatio: def.aspectRatio }}
    >
      {showLottie ? (
        <Lottie
          animationData={animationData}
          loop={loop}
          className="h-full w-full"
          aria-label={def.alt}
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- poster fallback until Lottie JSON loads */
        <img
          src={def.posterSrc}
          alt={def.alt}
          className="h-full w-full object-contain"
        />
      )}
    </div>
  );
};

export default LottieIllustration;
