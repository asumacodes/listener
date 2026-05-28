import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on everything except static assets, images, favicon, manifest, icons.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon.*\\.(?:png|svg)|.*\\.(?:png|svg|jpg|jpeg|gif|webp)$).*)",
  ],
};
