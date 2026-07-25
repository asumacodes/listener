import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { needsOnboarding } from "@/lib/profile/onboarding";
import type { Database } from "@/types/database";

// Used from the root proxy. Refreshes the auth cookie on every
// request and returns the (possibly mutated) NextResponse to be returned.
export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: do not put logic between createServerClient and getUser().
  // getUser() is what actually refreshes the token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Service workers must be served as static JS with no auth redirect.
  if (
    pathname === "/sw.js" ||
    pathname === "/push-sw.js" ||
    pathname.startsWith("/workbox-")
  ) {
    return response;
  }

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/auth");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isApiRoute = pathname.startsWith("/api/");
  // Preview-gated Sentry verify UI + tunnel (Phase 1 / Phase 6)
  const isSentryPublicRoute =
    pathname.startsWith("/debug/sentry") || pathname.startsWith("/monitoring");

  // Unauthenticated -> push to /login (pages only; API routes return their own 401)
  if (!user && !isAuthRoute && !isApiRoute && !isSentryPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated -> bounce away from /login
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Blocking first-run profile: empty / phone-fallback display name.
  if (user && !isApiRoute && !isAuthRoute && !isSentryPublicRoute) {
    const { data: profile } = await supabase
      .from("users")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    const incomplete = needsOnboarding(
      profile?.display_name,
      typeof user.phone === "string" ? user.phone : null
    );

    if (incomplete && !isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    if (!incomplete && isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
};
