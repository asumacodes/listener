import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { createClient } from "@/lib/supabase/server";

const withQuery = (path: string, params: Record<string, string>) => {
  const url = new URL(path, "http://local");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return `${url.pathname}${url.search}`;
};

/**
 * OAuth / identity-link callback.
 * - Success: exchange code, optionally sync email, redirect to `next`.
 * - Link collision: keep session, send user back to Settings with an error
 *   (never steal / merge identities).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const oauthError =
    searchParams.get("error_code") ??
    searchParams.get("error") ??
    searchParams.get("error_description");

  const nextPathname = next.split("?")[0] ?? next;
  const settingsFallback = nextPathname.startsWith("/account")
    ? nextPathname
    : nextPathname === "/projects"
      ? "/projects"
      : "/account/settings";

  if (oauthError) {
    const codeOrMessage = oauthError.toLowerCase();
    const dest = withQuery(settingsFallback, {
      link_error: codeOrMessage.includes("identity")
        ? "identity_already_exists"
        : codeOrMessage.includes("manual_linking")
          ? "manual_linking_disabled"
          : "link_failed",
    });
    return NextResponse.redirect(`${origin}${dest}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const message = (error.message ?? "").toLowerCase();
    const codeName = (error.code ?? "").toLowerCase();
    const isLinkCollision =
      codeName === "identity_already_exists" ||
      message.includes("identity_already_exists") ||
      message.includes("already been linked") ||
      message.includes("already linked");

    if (
      isLinkCollision ||
      next.startsWith("/account") ||
      nextPathname === "/projects"
    ) {
      const dest = withQuery(settingsFallback, {
        link_error: isLinkCollision
          ? "identity_already_exists"
          : codeName || "link_failed",
      });
      return NextResponse.redirect(`${origin}${dest}`);
    }

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Successful link / OAuth: fill a blank public.users.email, never clobber.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email) {
    await supabase
      .from("users")
      .update({ email: user.email })
      .eq("id", user.id)
      .is("email", null);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
