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
      <div className="rounded-2xl border border-dashed border-dashed-border bg-surface px-6 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
            Integrations · Atlassian
          </p>
          <span className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium tracking-[0.14em] text-muted uppercase">
            Not connected
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-10">
          <div className="min-w-0 max-w-xl">
            <h2 className="font-serif text-[26px] leading-[1.15] tracking-[-0.01em] text-text">
              Three artifacts are waiting on this
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Connect your Atlassian account so your Jira board and Confluence
              docs are created in your own workspace. Until then, Roadmap, Jira,
              and Confluence are skipped and the run delivers five of eight.
            </p>
          </div>
          <div className="shrink-0 text-center">
            <Button
              onClick={() => {
                window.location.href = "/api/integrations/atlassian/start";
              }}
            >
              Connect Atlassian
            </Button>
            <p className="mt-2 max-w-[18ch] text-xs leading-relaxed text-muted">
              Opens Atlassian&apos;s consent screen. Takes about a minute.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface px-6 py-6 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
          Integrations · Atlassian
        </p>
        <span className="rounded-full border border-transparent bg-success-surface px-2.5 py-0.5 text-[10px] font-medium tracking-[0.14em] text-success-text uppercase">
          Connected
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-10">
        <div className="min-w-0 max-w-xl">
          <h2 className="font-serif text-[26px] leading-[1.15] tracking-[-0.01em] text-text">
            Your Jira board and Confluence docs land in your own workspace
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Connect your Atlassian account so every run creates its board and
            space where your team already works. Three of the eight artifacts
            depend on it.
          </p>
        </div>

        <div className="w-[300px] shrink-0 rounded-2xl bg-canvas px-4 py-4">
          <div className="flex items-start gap-3">
            <AtlassianMark />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">
                {siteHost(status?.siteUrl)}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Connected · Jira + Confluence
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="!min-h-10 px-3 text-sm"
              onClick={() => {
                window.location.href = "/api/integrations/atlassian/start";
              }}
            >
              Change site
            </Button>
            <Button
              variant="secondary"
              className="!min-h-10 px-3 text-sm"
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
