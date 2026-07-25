"use client";

import { GitHubIcon, GoogleIcon } from "@/components/auth/ProviderIcons";
import Button from "@/components/ui/Button";
import {
  linkOAuthIdentity,
  listLinkedIdentities,
  unlinkOAuthIdentity,
  type LinkedIdentitySummary,
} from "@/lib/auth/identities";
import { copy } from "@/lib/design/copy";
import { identityLinkErrorMessage } from "@/lib/errors";
import type { OAuthProvider } from "@/types";
import { useCallback, useEffect, useState } from "react";

type LinkedAccountsCardProps = {
  onMessage: (message: string | null) => void;
  onLinked?: () => void | Promise<void>;
};

const providerLabel = (provider: string) => {
  if (provider === "google") return "Google";
  if (provider === "github") return "GitHub";
  if (provider === "phone") return copy.settings.phoneLinked;
  return provider;
};

const LinkedAccountsCard = ({
  onMessage,
  onLinked,
}: LinkedAccountsCardProps) => {
  const [identities, setIdentities] = useState<LinkedIdentitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<
    OAuthProvider | "unlink-google" | "unlink-github" | null
  >(null);

  const refresh = useCallback(async () => {
    const rows = await listLinkedIdentities();
    setIdentities(rows);
  }, []);

  useEffect(() => {
    let active = true;
    void listLinkedIdentities()
      .then((rows) => {
        if (active) setIdentities(rows);
      })
      .catch(() => {
        if (active) onMessage(identityLinkErrorMessage("load_failed"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [onMessage]);

  const has = (provider: string) =>
    identities.some((identity) => identity.provider === provider);

  const canUnlink = identities.length >= 2;

  const handleLink = async (provider: OAuthProvider) => {
    onMessage(null);
    setBusy(provider);
    try {
      const { error } = await linkOAuthIdentity(provider);
      if (error) {
        onMessage(identityLinkErrorMessage(error));
        setBusy(null);
      }
      // On success the browser redirects to Google/GitHub.
    } catch (err) {
      onMessage(identityLinkErrorMessage(err));
      setBusy(null);
    }
  };

  const handleUnlink = async (provider: OAuthProvider) => {
    onMessage(null);
    setBusy(provider === "google" ? "unlink-google" : "unlink-github");
    try {
      const { error } = await unlinkOAuthIdentity(provider);
      if (error) {
        onMessage(identityLinkErrorMessage(error));
        return;
      }
      await refresh();
      await onLinked?.();
    } catch (err) {
      onMessage(identityLinkErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-muted">Loading linked accounts…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm leading-relaxed text-text-secondary">
        {copy.settings.linkedAccountsLead}
      </p>

      {(["google", "github"] as const).map((provider) => {
        const linked = has(provider);
        const identity = identities.find((row) => row.provider === provider);
        const Icon = provider === "google" ? GoogleIcon : GitHubIcon;
        const linking = busy === provider;
        const unlinking =
          busy === (provider === "google" ? "unlink-google" : "unlink-github");

        return (
          <div
            key={provider}
            className="flex items-center gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-canvas">
              <Icon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text">
                {providerLabel(provider)}
              </p>
              <p className="truncate text-[13px] text-muted">
                {linked
                  ? (identity?.email ?? copy.settings.linked)
                  : "Not linked"}
              </p>
            </div>
            {linked ? (
              <Button
                variant="secondary"
                disabled={!canUnlink || unlinking || busy !== null}
                onClick={() => void handleUnlink(provider)}
                className="shrink-0 px-3"
              >
                {unlinking ? "…" : copy.settings.unlink}
              </Button>
            ) : (
              <Button
                variant="secondary"
                disabled={busy !== null}
                onClick={() => void handleLink(provider)}
                className="shrink-0 gap-2 px-3"
              >
                <Icon />
                {linking
                  ? "…"
                  : provider === "google"
                    ? copy.settings.linkGoogle
                    : copy.settings.linkGitHub}
              </Button>
            )}
          </div>
        );
      })}

      {has("phone") ? (
        <p className="border-t border-border pt-3 text-[13px] text-muted">
          {copy.settings.phoneLinked} is your primary sign-in on this account.
        </p>
      ) : null}
    </div>
  );
};

export default LinkedAccountsCard;
