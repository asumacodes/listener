"use client";

import type { ReactNode } from "react";

const ARTIFACT_PILLS = [
  "PRD",
  "Competitors",
  "Brand kit",
  "Jira",
  "Confluence",
] as const;

type DesktopAuthShellProps = {
  children: ReactNode;
  /** Kept for call-site compat; form column is always white. */
  formOnWhite?: boolean;
};

/**
 * Desktop standalone auth frame — 50/50 editorial + form, full viewport.
 * Used at lg+ only; mobile AuthScreen stays unchanged.
 */
const DesktopAuthShell = ({ children }: DesktopAuthShellProps) => (
  <main className="flex min-h-dvh w-full">
    <section className="flex w-1/2 shrink-0 flex-col justify-between border-r border-border bg-canvas px-14 pt-14 pb-12">
      <div className="font-serif text-[26px] leading-none text-text">
        Listener
      </div>
      <div className="mx-auto w-full max-w-[470px] text-center">
        <h1 className="font-serif text-[52px] leading-[1.1] text-text text-pretty">
          Eighteen seconds of talking. Eight finished artifacts.
        </h1>
        <p className="mx-auto mt-5 max-w-[420px] text-[15px] leading-[1.7] text-text-secondary text-pretty">
          Say the idea out loud and Listener returns a transcript, a competitor
          map, a PRD, a brand kit, an engineering brief — and a live Jira board
          in your own Atlassian workspace.
        </p>
      </div>
      <div>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <p className="text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
            Speak. Transcribe. Build.
          </p>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {ARTIFACT_PILLS.map((label) => (
            <span
              key={label}
              className="flex h-[26px] items-center rounded-full border border-border bg-surface px-[11px] text-[11px] text-text-secondary"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
    <section className="flex w-1/2 min-w-0 flex-col justify-center bg-white px-14 py-14">
      {children}
    </section>
  </main>
);

export default DesktopAuthShell;
