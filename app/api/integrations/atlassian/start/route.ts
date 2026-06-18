// app/api/integrations/atlassian/start/route.ts
// Begins the OAuth flow: generates a CSRF state, stashes it in an HttpOnly
// cookie, redirects the user to Atlassian's consent screen.

import { buildAuthorizeUrl } from "@/lib/integrations/atlassian/oauth";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

const siteUrl = (path: string) =>
  new URL(path, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(siteUrl("/login"));
  }

  const clientId = process.env.ATLASSIAN_CLIENT_ID;
  const redirectUri = process.env.ATLASSIAN_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "atlassian_not_configured" },
      { status: 501 }
    );
  }

  // State binds this flow to this user/session (CSRF protection).
  const state = randomBytes(32).toString("base64url");
  const authorizeUrl = buildAuthorizeUrl({ clientId, redirectUri, state });

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set("atl_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 min
  });
  return res;
}
