// app/api/integrations/atlassian/callback/route.ts
// Atlassian redirects here after consent. Validates state, exchanges the code,
// fetches the user's cloudId/site, encrypts + persists the connection.

import {
  exchangeCodeForTokens,
  fetchAccessibleResources,
} from "@/lib/integrations/atlassian/oauth";
import { upsertConnection } from "@/lib/integrations/atlassian/connection-store";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const siteUrl = (path: string) =>
  new URL(path, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

const settingsUrl = (q: string) => siteUrl(`/account/settings?atlassian=${q}`);

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(siteUrl("/login"));

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // User denied consent, or Atlassian errored.
  if (error || !code) {
    return NextResponse.redirect(settingsUrl("denied"));
  }

  // CSRF: returned state must match the cookie we set in /start.
  const cookieState = req.cookies.get("atl_oauth_state")?.value;
  if (!cookieState || !returnedState || cookieState !== returnedState) {
    return NextResponse.redirect(settingsUrl("state_mismatch"));
  }

  const clientId = process.env.ATLASSIAN_CLIENT_ID;
  const clientSecret = process.env.ATLASSIAN_CLIENT_SECRET;
  const redirectUri = process.env.ATLASSIAN_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(settingsUrl("not_configured"));
  }

  try {
    const tokens = await exchangeCodeForTokens({
      clientId,
      clientSecret,
      code,
      redirectUri,
    });

    const resources = await fetchAccessibleResources(tokens.access_token);
    if (!resources.length) {
      // User has no accessible Atlassian site.
      return NextResponse.redirect(settingsUrl("no_site"));
    }
    // Single-connection model: take the first site. (Multi-site is v2.)
    const site = resources[0];

    const accessExpiresAt = new Date(
      Date.now() + tokens.expires_in * 1000
    ).toISOString();

    await upsertConnection({
      userId: user.id,
      cloudId: site.id,
      siteUrl: site.url,
      scopes: tokens.scope,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      accessExpiresAt,
    });

    const isPopup = req.cookies.get("atl_oauth_popup")?.value === "1";
    if (isPopup) {
      const html = `<!doctype html><html><body><script>
        try { window.opener && window.opener.postMessage({ atlassian: "connected" }, window.location.origin); } catch (e) {}
        window.close();
      </script>Connected. You can close this window.</body></html>`;
      const res = new NextResponse(html, {
        headers: { "Content-Type": "text/html" },
      });
      res.cookies.delete("atl_oauth_state");
      res.cookies.delete("atl_oauth_popup");
      return res;
    }

    const res = NextResponse.redirect(settingsUrl("connected"));
    res.cookies.delete("atl_oauth_state");
    res.cookies.delete("atl_oauth_popup");
    return res;
  } catch {
    // Never log token bodies/codes. Generic failure to Settings.
    return NextResponse.redirect(settingsUrl("error"));
  }
}
