import IllustrationFrame from "@/components/illustrations/pipeline/IllustrationFrame";
import type { PipelineIllustrationProps } from "@/types/illustration";
import type { CSSProperties } from "react";

const delay = (seconds: number): CSSProperties => ({
  ["--d" as string]: `${seconds}s`,
});

const ResearchingIllustration = (props: PipelineIllustrationProps) => (
  <IllustrationFrame ariaLabel="Researching the market" {...props}>
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(0)}
      x1="44"
      y1="58"
      x2="74"
      y2="82"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(0.3)}
      x1="92"
      y1="40"
      x2="74"
      y2="82"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(0.6)}
      x1="92"
      y1="40"
      x2="122"
      y2="66"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(0.9)}
      x1="122"
      y1="66"
      x2="112"
      y2="104"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(1.2)}
      x1="74"
      y1="82"
      x2="112"
      y2="104"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(1.5)}
      x1="74"
      y1="82"
      x2="52"
      y2="108"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(1.8)}
      x1="52"
      y1="108"
      x2="86"
      y2="128"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(2.1)}
      x1="112"
      y1="104"
      x2="86"
      y2="128"
    />
    <circle className="ill-pulse" style={delay(0)} cx="44" cy="58" r="3.4" />
    <circle
      className="ill-pulse ill-fill"
      style={delay(0.4)}
      cx="92"
      cy="40"
      r="3.2"
    />
    <circle className="ill-pulse" style={delay(0.8)} cx="122" cy="66" r="3.4" />
    <circle
      className="ill-pulse ill-fill"
      style={delay(1.2)}
      cx="74"
      cy="82"
      r="3.4"
    />
    <circle
      className="ill-pulse"
      style={delay(1.6)}
      cx="112"
      cy="104"
      r="3.4"
    />
    <circle
      className="ill-pulse ill-fill"
      style={delay(2)}
      cx="52"
      cy="108"
      r="3.2"
    />
    <circle className="ill-pulse" style={delay(2.4)} cx="86" cy="128" r="3.4" />
  </IllustrationFrame>
);

export default ResearchingIllustration;
