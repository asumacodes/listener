import IllustrationFrame from "@/components/illustrations/pipeline/IllustrationFrame";
import type { PipelineIllustrationProps } from "@/types/illustration";
import type { CSSProperties } from "react";

const delay = (seconds: number, dur = 4.4): CSSProperties => ({
  ["--d" as string]: `${seconds}s`,
  ["--dur" as string]: `${dur}s`,
});

const DesigningBrandIllustration = (props: PipelineIllustrationProps) => (
  <IllustrationFrame ariaLabel="Designing the brand" {...props}>
    <path
      className="ill-draw"
      pathLength={1}
      style={delay(0, 4.8)}
      d="M52 106 L80 30 L108 106"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(0.7, 4.8)}
      x1="63"
      y1="82"
      x2="97"
      y2="82"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(1.1, 4.8)}
      x1="44"
      y1="106"
      x2="60"
      y2="106"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(1.3, 4.8)}
      x1="100"
      y1="106"
      x2="116"
      y2="106"
    />
    <rect
      className="ill-popin ill-fill"
      style={delay(1.7)}
      x="44"
      y="122"
      width="18"
      height="18"
      rx="4"
    />
    <rect
      className="ill-popin ill-fill-warm"
      style={delay(2)}
      x="71"
      y="122"
      width="18"
      height="18"
      rx="4"
    />
    <rect
      className="ill-popin"
      style={delay(2.3)}
      x="98"
      y="122"
      width="18"
      height="18"
      rx="4"
    />
  </IllustrationFrame>
);

export default DesigningBrandIllustration;
