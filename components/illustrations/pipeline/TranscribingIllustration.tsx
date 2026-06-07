import IllustrationFrame from "@/components/illustrations/pipeline/IllustrationFrame";
import type { PipelineIllustrationProps } from "@/types/illustration";
import type { CSSProperties } from "react";

const delay = (seconds: number): CSSProperties => ({
  ["--d" as string]: `${seconds}s`,
});

const TranscribingIllustration = (props: PipelineIllustrationProps) => (
  <IllustrationFrame ariaLabel="Transcribing" {...props}>
    <g>
      <line
        className="ill-breathe"
        style={{ ...delay(0), transformOrigin: "30px 54px" }}
        x1="30"
        y1="46"
        x2="30"
        y2="62"
      />
      <line
        className="ill-breathe"
        style={{ ...delay(0.12), transformOrigin: "40px 54px" }}
        x1="40"
        y1="38"
        x2="40"
        y2="70"
      />
      <line
        className="ill-breathe"
        style={{ ...delay(0.24), transformOrigin: "50px 54px" }}
        x1="50"
        y1="28"
        x2="50"
        y2="80"
      />
      <line
        className="ill-breathe"
        style={{ ...delay(0.36), transformOrigin: "60px 54px" }}
        x1="60"
        y1="42"
        x2="60"
        y2="66"
      />
      <line
        className="ill-breathe"
        style={{ ...delay(0.48), transformOrigin: "70px 54px" }}
        x1="70"
        y1="24"
        x2="70"
        y2="84"
      />
      <line
        className="ill-breathe"
        style={{ ...delay(0.6), transformOrigin: "80px 54px" }}
        x1="80"
        y1="34"
        x2="80"
        y2="74"
      />
      <line
        className="ill-breathe"
        style={{ ...delay(0.72), transformOrigin: "90px 54px" }}
        x1="90"
        y1="20"
        x2="90"
        y2="88"
      />
      <line
        className="ill-breathe"
        style={{ ...delay(0.84), transformOrigin: "100px 54px" }}
        x1="100"
        y1="40"
        x2="100"
        y2="68"
      />
      <line
        className="ill-breathe"
        style={{ ...delay(0.96), transformOrigin: "110px 54px" }}
        x1="110"
        y1="30"
        x2="110"
        y2="78"
      />
      <line
        className="ill-breathe"
        style={{ ...delay(1.08), transformOrigin: "120px 54px" }}
        x1="120"
        y1="44"
        x2="120"
        y2="64"
      />
      <line
        className="ill-breathe"
        style={{ ...delay(1.2), transformOrigin: "130px 54px" }}
        x1="130"
        y1="36"
        x2="130"
        y2="72"
      />
    </g>
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(0)}
      x1="30"
      y1="100"
      x2="130"
      y2="100"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(0.5)}
      x1="30"
      y1="114"
      x2="108"
      y2="114"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(1)}
      x1="30"
      y1="128"
      x2="122"
      y2="128"
    />
    <line
      className="ill-draw"
      pathLength={1}
      style={delay(1.5)}
      x1="30"
      y1="142"
      x2="86"
      y2="142"
    />
  </IllustrationFrame>
);

export default TranscribingIllustration;
