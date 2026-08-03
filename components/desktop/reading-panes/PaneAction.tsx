"use client";

import Button from "@/components/ui/Button";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type PaneActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/** Gold outline action — downloads/copy never use red. */
export const PaneAction = ({
  children,
  className = "",
  ...props
}: PaneActionProps) => (
  <Button
    variant="outline"
    className={`!min-h-8 !rounded-full !px-3.5 !text-[11px] ${className}`}
    {...props}
  >
    {children}
  </Button>
);
