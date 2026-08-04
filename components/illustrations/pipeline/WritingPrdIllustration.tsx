import IllustrationFrame from "@/components/illustrations/pipeline/IllustrationFrame";
import type { PipelineIllustrationProps } from "@/types/illustration";
import type { CSSProperties } from "react";

const delay = (seconds: number): CSSProperties => ({
  ["--d" as string]: `${seconds}s`,
});

const WritingPrdIllustration = (props: PipelineIllustrationProps) => {
  const desktop = props.scale === "desktop";

  if (desktop) {
    return (
      <IllustrationFrame ariaLabel="Writing the PRD" {...props}>
        <path d="M46 35 Q46 28 53 28 L98 28 L116 46 L116 125 Q116 132 109 132 L53 132 Q46 132 46 125 Z" />
        <path d="M98 28 L98 46 L116 46" />
        <line
          className="ill-draw ill-deep"
          pathLength={1}
          style={{ ...delay(0), strokeWidth: 3.8 }}
          x1="58"
          y1="44"
          x2="88"
          y2="44"
        />
        <line
          className="ill-draw"
          pathLength={1}
          style={delay(0.3)}
          x1="58"
          y1="56"
          x2="100"
          y2="56"
        />
        <line
          className="ill-draw"
          pathLength={1}
          style={delay(0.6)}
          x1="58"
          y1="64"
          x2="106"
          y2="64"
        />
        <line
          className="ill-draw"
          pathLength={1}
          style={delay(0.9)}
          x1="58"
          y1="72"
          x2="104"
          y2="72"
        />
        <line
          className="ill-draw"
          pathLength={1}
          style={delay(1.2)}
          x1="58"
          y1="84"
          x2="92"
          y2="84"
        />
        <line
          className="ill-draw"
          pathLength={1}
          style={delay(1.5)}
          x1="58"
          y1="96"
          x2="104"
          y2="96"
        />
        <circle
          className="ill-popin ill-fill"
          style={delay(1.8)}
          cx="60"
          cy="112"
          r="3"
        />
        <line
          className="ill-draw"
          pathLength={1}
          style={delay(1.9)}
          x1="70"
          y1="112"
          x2="104"
          y2="112"
        />
        <circle
          className="ill-popin ill-fill"
          style={delay(2.2)}
          cx="60"
          cy="124"
          r="3"
        />
        <line
          className="ill-draw"
          pathLength={1}
          style={delay(2.3)}
          x1="70"
          y1="124"
          x2="94"
          y2="124"
        />
      </IllustrationFrame>
    );
  }

  return (
    <IllustrationFrame ariaLabel="Writing the PRD" {...props}>
      <path d="M46 35 Q46 28 53 28 L98 28 L116 46 L116 125 Q116 132 109 132 L53 132 Q46 132 46 125 Z" />
      <path d="M98 28 L98 46 L116 46" />
      <line
        className="ill-draw"
        pathLength={1}
        style={delay(0)}
        x1="58"
        y1="56"
        x2="100"
        y2="56"
      />
      <line
        className="ill-draw"
        pathLength={1}
        style={delay(0.4)}
        x1="58"
        y1="72"
        x2="106"
        y2="72"
      />
      <line
        className="ill-draw"
        pathLength={1}
        style={delay(0.8)}
        x1="58"
        y1="84"
        x2="92"
        y2="84"
      />
      <line
        className="ill-draw"
        pathLength={1}
        style={delay(1.2)}
        x1="58"
        y1="96"
        x2="104"
        y2="96"
      />
      <circle
        className="ill-popin ill-fill"
        style={delay(1.5)}
        cx="60"
        cy="112"
        r="2.4"
      />
      <line
        className="ill-draw"
        pathLength={1}
        style={delay(1.6)}
        x1="70"
        y1="112"
        x2="104"
        y2="112"
      />
      <circle
        className="ill-popin ill-fill"
        style={delay(1.9)}
        cx="60"
        cy="124"
        r="2.4"
      />
      <line
        className="ill-draw"
        pathLength={1}
        style={delay(2)}
        x1="70"
        y1="124"
        x2="94"
        y2="124"
      />
    </IllustrationFrame>
  );
};

export default WritingPrdIllustration;
