import IllustrationFrame from "@/components/illustrations/pipeline/IllustrationFrame";
import type { PipelineIllustrationProps } from "@/types/illustration";

const RehydrationIllustration = (props: PipelineIllustrationProps) => (
  <IllustrationFrame ariaLabel="Rehydration splash" {...props}>
    <line
      className="ill-breathe-uni"
      style={{ transformOrigin: "56px 80px" }}
      x1="56"
      y1="72"
      x2="56"
      y2="88"
    />
    <line
      className="ill-breathe-uni"
      style={{ transformOrigin: "64px 80px" }}
      x1="64"
      y1="64"
      x2="64"
      y2="96"
    />
    <line
      className="ill-breathe-uni"
      style={{ transformOrigin: "72px 80px" }}
      x1="72"
      y1="56"
      x2="72"
      y2="104"
    />
    <line
      className="ill-breathe-uni"
      style={{ transformOrigin: "80px 80px" }}
      x1="80"
      y1="50"
      x2="80"
      y2="110"
    />
    <line
      className="ill-breathe-uni"
      style={{ transformOrigin: "88px 80px" }}
      x1="88"
      y1="56"
      x2="88"
      y2="104"
    />
    <line
      className="ill-breathe-uni"
      style={{ transformOrigin: "96px 80px" }}
      x1="96"
      y1="64"
      x2="96"
      y2="96"
    />
    <line
      className="ill-breathe-uni"
      style={{ transformOrigin: "104px 80px" }}
      x1="104"
      y1="72"
      x2="104"
      y2="88"
    />
  </IllustrationFrame>
);

export default RehydrationIllustration;
