"use client";

import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

type AuthSpinnerProps = {
  className?: string;
};

/** Thin gold ring for OAuth redirect — static when reduced motion. */

const AuthSpinner = ({ className = "" }: AuthSpinnerProps) => {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div
      className={`h-10 w-10 rounded-full border-2 border-gold/20 border-t-gold ${
        reduceMotion ? "" : "animate-spin-slow"
      } ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default AuthSpinner;
