"use client";

import AuthLayout from "@/components/auth/AuthLayout";

import AuthSpinner from "@/components/auth/AuthSpinner";

import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";

import type { OAuthProvider } from "@/types";

type OAuthRedirectSurfaceProps = {
  provider: OAuthProvider;
};

const oauthCopy: Record<OAuthProvider, string> = {
  google: copy.auth.oauth.google,

  github: copy.auth.oauth.github,
};

const OAuthRedirectSurface = ({ provider }: OAuthRedirectSurfaceProps) => (
  <AuthLayout centered>
    <div className="flex flex-col items-center text-center">
      <div className="font-serif text-[34px] leading-none tracking-[-0.01em] text-gold">
        Listener
      </div>

      <div className="mt-16 flex flex-col items-center gap-4">
        <AuthSpinner />

        <p className={`${ui.eyebrow} normal-case text-muted`}>
          {oauthCopy[provider]}
        </p>
      </div>
    </div>
  </AuthLayout>
);

export default OAuthRedirectSurface;
