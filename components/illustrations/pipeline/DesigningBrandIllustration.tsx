import IllustrationFrame from "@/components/illustrations/pipeline/IllustrationFrame";
import type { PipelineIllustrationProps } from "@/types/illustration";
import type { CSSProperties } from "react";

const delay = (seconds: number, dur = 4.4): CSSProperties => ({
  ["--d" as string]: `${seconds}s`,
  ["--dur" as string]: `${dur}s`,
});

const DesigningBrandIllustration = (props: PipelineIllustrationProps) => {
  const desktop = props.scale === "desktop";

  if (desktop) {
    return (
      <IllustrationFrame ariaLabel="Designing the brand" {...props}>
        <path
          className="ill-draw"
          pathLength={1}
          style={delay(0, 4.8)}
          d="M46 108 L80 26 L114 108"
        />
        <line
          className="ill-draw"
          pathLength={1}
          style={delay(0.7, 4.8)}
          x1="58"
          y1="84"
          x2="102"
          y2="84"
        />
        <line
          className="ill-draw"
          pathLength={1}
          style={delay(1.1, 4.8)}
          x1="36"
          y1="108"
          x2="54"
          y2="108"
        />
        <line
          className="ill-draw"
          pathLength={1}
          style={delay(1.3, 4.8)}
          x1="106"
          y1="108"
          x2="124"
          y2="108"
        />
        <line
          className="ill-draw ill-deep"
          pathLength={1}
          style={delay(1.5, 4.8)}
          x1="72"
          y1="26"
          x2="88"
          y2="26"
        />
        <rect
          className="ill-snapin ill-fill"
          style={delay(1.8)}
          x="30"
          y="122"
          width="17"
          height="17"
          rx="4"
        />
        <rect
          className="ill-snapin ill-fill"
          style={delay(2.05)}
          x="52"
          y="122"
          width="17"
          height="17"
          rx="4"
        />
        <rect
          className="ill-snapin ill-fill-warm"
          style={delay(2.3)}
          x="74"
          y="122"
          width="17"
          height="17"
          rx="4"
        />
        <rect
          className="ill-snapin"
          style={{
            ...delay(2.55),
            fill: "var(--ill-gold)",
            opacity: 0.3,
            stroke: "none",
          }}
          x="96"
          y="122"
          width="17"
          height="17"
          rx="4"
        />
        <rect
          className="ill-snapin"
          style={delay(2.8)}
          x="118"
          y="122"
          width="17"
          height="17"
          rx="4"
        />
      </IllustrationFrame>
    );
  }

  return (
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
};

export default DesigningBrandIllustration;
