"use client";

import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

import { useScreenEnter } from "@/motion/useScreenEnter";

import { ReactNode, useRef } from "react";

type AuthLayoutProps = {
  children: ReactNode;

  centered?: boolean;
};

const AuthLayout = ({ children, centered = false }: AuthLayoutProps) => {
  const containerRef = useRef<HTMLElement>(null);

  const reduceMotion = usePrefersReducedMotion();

  useScreenEnter({ containerRef, enabled: !reduceMotion });

  return (
    <main
      ref={containerRef}
      className={`mx-auto flex min-h-dvh w-full flex-col px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] py-12 ${
        centered ? "items-center justify-center" : ""
      }`}
    >
      {children}
    </main>
  );
};

export default AuthLayout;
