import IllustrationFrame from "@/components/illustrations/pipeline/IllustrationFrame";
import type { PipelineIllustrationProps } from "@/types/illustration";
import type { CSSProperties } from "react";

const delay = (seconds: number): CSSProperties => ({
  ["--d" as string]: `${seconds}s`,
});

const BuildingBoardIllustration = (props: PipelineIllustrationProps) => {
  const desktop = props.scale === "desktop";

  if (desktop) {
    return (
      <IllustrationFrame ariaLabel="Building your board" {...props}>
        <rect
          className="ill-soft"
          x="26"
          y="30"
          width="32"
          height="108"
          rx="6"
        />
        <rect
          className="ill-soft"
          x="64"
          y="30"
          width="32"
          height="108"
          rx="6"
        />
        <rect
          className="ill-soft"
          x="102"
          y="30"
          width="32"
          height="108"
          rx="6"
        />
        <line
          className="ill-draw ill-deep"
          pathLength={1}
          style={delay(0)}
          x1="30"
          y1="22"
          x2="48"
          y2="22"
        />
        <line
          className="ill-draw ill-deep"
          pathLength={1}
          style={delay(0.2)}
          x1="68"
          y1="22"
          x2="86"
          y2="22"
        />
        <line
          className="ill-draw ill-deep"
          pathLength={1}
          style={delay(0.4)}
          x1="106"
          y1="22"
          x2="124"
          y2="22"
        />
        <rect
          className="ill-snapin"
          style={delay(0.6)}
          x="30"
          y="38"
          width="24"
          height="16"
          rx="3"
        />
        <rect
          className="ill-snapin"
          style={delay(0.9)}
          x="30"
          y="60"
          width="24"
          height="16"
          rx="3"
        />
        <rect
          className="ill-snapin"
          style={delay(1.2)}
          x="30"
          y="82"
          width="24"
          height="16"
          rx="3"
        />
        <rect
          className="ill-snapin"
          style={delay(1.5)}
          x="30"
          y="104"
          width="24"
          height="16"
          rx="3"
        />
        <rect
          className="ill-snapin ill-fill"
          style={delay(1.8)}
          x="68"
          y="38"
          width="24"
          height="16"
          rx="3"
        />
        <rect
          className="ill-snapin"
          style={delay(2.1)}
          x="68"
          y="60"
          width="24"
          height="16"
          rx="3"
        />
        <rect
          className="ill-snapin"
          style={delay(2.4)}
          x="68"
          y="82"
          width="24"
          height="16"
          rx="3"
        />
        <rect
          className="ill-snapin"
          style={delay(2.7)}
          x="106"
          y="38"
          width="24"
          height="16"
          rx="3"
        />
        <rect
          className="ill-snapin"
          style={delay(3)}
          x="106"
          y="60"
          width="24"
          height="16"
          rx="3"
        />
        <rect
          className="ill-snapin"
          style={delay(3.3)}
          x="106"
          y="82"
          width="24"
          height="16"
          rx="3"
        />
      </IllustrationFrame>
    );
  }

  return (
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
};

export default BuildingBoardIllustration;
