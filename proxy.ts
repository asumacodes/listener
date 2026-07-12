import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Skip static assets, icons, and service workers (SW scripts must not redirect).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon.*\\.(?:png|svg)|sw\\.js|push-sw\\.js|workbox-.*\\.js|.*\\.(?:png|svg|jpg|jpeg|gif|webp)$).*)",
  ],
};
