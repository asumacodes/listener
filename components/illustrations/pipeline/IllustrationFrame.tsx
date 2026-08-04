"use client";

import "./illustration-motion.css";
import type { PipelineIllustrationProps } from "@/types/illustration";
import type { ReactNode } from "react";

type IllustrationFrameProps = PipelineIllustrationProps & {
  ariaLabel: string;
  children: ReactNode;
};

const IllustrationFrame = ({
  size = 150,
  animated = true,
  className = "",
  scale = "mobile",
  ariaLabel,
  children,
}: IllustrationFrameProps) => (
  <div
    className={`ill-root flex items-center justify-center ${animated ? "" : "ill-static"} ${className}`}
    data-scale={scale}
    style={{ width: size, height: size }}
  >
    <svg
      className="ill-svg"
      viewBox="0 0 160 160"
      width={size}
      height={size}
      role="img"
      aria-label={ariaLabel}
    >
      {children}
    </svg>
  </div>
);

export default IllustrationFrame;
