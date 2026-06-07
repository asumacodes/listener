import IllustrationFrame from "@/components/illustrations/pipeline/IllustrationFrame";
import type { PipelineIllustrationProps } from "@/types/illustration";
import type { CSSProperties } from "react";

const delay = (seconds: number): CSSProperties => ({
  ["--d" as string]: `${seconds}s`,
});

const BuildingBoardIllustration = (props: PipelineIllustrationProps) => (
  <IllustrationFrame ariaLabel="Building your board" {...props}>
    <rect className="ill-soft" x="26" y="34" width="32" height="98" rx="6" />
    <rect className="ill-soft" x="64" y="34" width="32" height="98" rx="6" />
    <rect className="ill-soft" x="102" y="34" width="32" height="98" rx="6" />
    <rect
      className="ill-snapin"
      style={delay(0)}
      x="30"
      y="42"
      width="24"
      height="16"
      rx="3"
    />
    <rect
      className="ill-snapin"
      style={delay(0.4)}
      x="30"
      y="64"
      width="24"
      height="16"
      rx="3"
    />
    <rect
      className="ill-snapin"
      style={delay(0.8)}
      x="30"
      y="86"
      width="24"
      height="16"
      rx="3"
    />
    <rect
      className="ill-snapin ill-fill"
      style={delay(1.2)}
      x="68"
      y="42"
      width="24"
      height="16"
      rx="3"
    />
    <rect
      className="ill-snapin"
      style={delay(1.6)}
      x="68"
      y="64"
      width="24"
      height="16"
      rx="3"
    />
    <rect
      className="ill-snapin"
      style={delay(2)}
      x="106"
      y="42"
      width="24"
      height="16"
      rx="3"
    />
    <rect
      className="ill-snapin"
      style={delay(2.4)}
      x="106"
      y="64"
      width="24"
      height="16"
      rx="3"
    />
    <rect
      className="ill-snapin"
      style={delay(2.8)}
      x="106"
      y="86"
      width="24"
      height="16"
      rx="3"
    />
  </IllustrationFrame>
);

export default BuildingBoardIllustration;
