"use client";

import Button from "@/components/ui/Button";
import type { AtlassianStatus } from "@/lib/integrations/atlassian/client";

type AtlassianIntegrationCardProps = {
  status: AtlassianStatus | null;
  onDisconnect: () => void | Promise<void>;
};

const siteHost = (siteUrl?: string) => {
  if (!siteUrl) return "Atlassian site";
  try {
    return new URL(siteUrl).hostname;
  } catch {
    return siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
};

const AtlassianMark = () => (
  <span
    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-surface"
    aria-hidden
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5 14.5 8 8 14.5 1.5 8 8 1.5Z" fill="#C9A96E" />
    </svg>
  </span>
);

/**
 * Desktop Settings Atlassian block — connected / not-connected per mock.
 * Gold Connect CTA when disconnected; never red for the connect action.
 */
const AtlassianIntegrationCard = ({
  status,
  onDisconnect,
}: AtlassianIntegrationCardProps) => {
  const connected = Boolean(status?.connected);

  if (!connected) {
    return (
      <div className="rounded-2xl border border-dashed border-dashed-border bg-surface px-7 py-7">
        <div className="flex flex-wrap items-center gap-2.5">
          <p className="text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
            Integrations · Atlassian
          </p>
          <span className="rounded-full border border-dashed-border px-2.5 py-0.5 text-[9px] font-medium tracking-[0.1em] text-muted uppercase">
            Not connected
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-8">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-[26px] leading-[1.2] tracking-[-0.01em] text-text">
              Three artifacts are waiting on this
            </h2>
            <p className="mt-2.5 max-w-[560px] text-[13px] leading-[1.65] text-text-secondary text-pretty">
              Connect your Atlassian account so your Jira board and Confluence
              docs are created in your own workspace. Until then, Roadmap, Jira,
              and Confluence are skipped and the run delivers five of eight.
            </p>
          </div>
          {/* Fixed-width CTA column — full-bleed pill + centered caption */}
          <div className="flex w-[300px] shrink-0 flex-col gap-2.5">
            <Button
              className="!min-h-11 w-full rounded-full text-[13px]"
              onClick={() => {
                window.location.href =
                  "/api/integrations/atlassian/start?context=settings";
              }}
            >
              Connect Atlassian
            </Button>
            <p className="text-center text-[11px] leading-[1.55] text-muted">
              Opens Atlassian&apos;s consent screen. Takes about a minute.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gold/30 bg-surface px-7 py-7 shadow-card">
      <div className="flex flex-wrap items-center gap-2.5">
        <p className="text-[10px] font-medium tracking-[0.18em] text-muted uppercase">
          Integrations · Atlassian
        </p>
        <span className="rounded-full border border-transparent bg-success-surface px-2.5 py-0.5 text-[9px] font-medium tracking-[0.1em] text-success-text uppercase">
          Connected
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-8">
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-[26px] leading-[1.2] tracking-[-0.01em] text-text">
            Your Jira board and Confluence docs land in your own workspace
          </h2>
          <p className="mt-2.5 max-w-[560px] text-[13px] leading-[1.65] text-text-secondary text-pretty">
            Connect your Atlassian account so every run creates its board and
            space where your team already works. Three of the eight artifacts
            depend on it.
          </p>
        </div>

        <div className="flex w-[360px] shrink-0 flex-col gap-3.5 rounded-xl bg-canvas px-5 py-5">
          <div className="flex items-center gap-3">
            <AtlassianMark />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-text">
                {siteHost(status?.siteUrl)}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                Connected · Jira + Confluence
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="!min-h-9 flex-1 rounded-full px-3 text-xs"
              onClick={() => {
                window.location.href =
                  "/api/integrations/atlassian/start?context=settings";
              }}
            >
              Change site
            </Button>
            <Button
              variant="secondary"
              className="!min-h-9 flex-1 rounded-full px-3 text-xs"
              onClick={() => void onDisconnect()}
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtlassianIntegrationCard;
