import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { needsOnboarding } from "@/lib/profile/onboarding";
import {
  isSurfaceExemptPath,
  resolveListenerSurface,
  SURFACE_COOKIE,
  SURFACE_HEADER,
  toDesktopInternalPath,
  toMobilePublicPath,
} from "@/lib/layout/surface";
import type { Database } from "@/types/database";

const withSurfaceHeaders = (response: NextResponse, surface: string) => {
  response.headers.set(SURFACE_HEADER, surface);
  response.headers.set("Accept-CH", "Sec-CH-UA-Mobile");
  response.headers.set("Critical-CH", "Sec-CH-UA-Mobile");
  return response;
};

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
  const isSentryPublicRoute =
    pathname.startsWith("/debug/sentry") || pathname.startsWith("/monitoring");

  if (!user && !isAuthRoute && !isApiRoute && !isSentryPublicRoute) {
    const url = request.nextUrl.clone();
    const target = request.nextUrl.pathname + request.nextUrl.search;
    url.pathname = "/login";
    url.search = "";
    const next = safeNextPath(target);
    if (next !== "/") {
      url.searchParams.set("next", next);
    }
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

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

    if (!incomplete && isOnboardingRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Device-split: rewrite desktop traffic into app/d/* (same public URLs).
  if (!isApiRoute && !isAuthRoute && !isSentryPublicRoute) {
    const surface = resolveListenerSurface({
      cookieValue: request.cookies.get(SURFACE_COOKIE)?.value,
      secChUaMobile: request.headers.get("sec-ch-ua-mobile"),
      userAgent: request.headers.get("user-agent"),
    });

    if (surface === "desktop" && !isSurfaceExemptPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = toDesktopInternalPath(pathname);
      const rewritten = NextResponse.rewrite(url, { request });
      response.cookies.getAll().forEach((c) => {
        rewritten.cookies.set(c.name, c.value);
      });
      return withSurfaceHeaders(rewritten, surface);
    }

    if (surface === "mobile" && pathname.startsWith("/d")) {
      const url = request.nextUrl.clone();
      url.pathname = toMobilePublicPath(pathname);
      const rewritten = NextResponse.rewrite(url, { request });
      response.cookies.getAll().forEach((c) => {
        rewritten.cookies.set(c.name, c.value);
      });
      return withSurfaceHeaders(rewritten, surface);
    }

    return withSurfaceHeaders(response, surface);
  }

  return response;
};
