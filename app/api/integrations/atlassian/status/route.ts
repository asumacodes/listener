// app/api/integrations/atlassian/status/route.ts
// Lightweight connected/not-connected for the Settings UI.

import { getConnectionStatus } from "@/lib/integrations/atlassian/connection-store";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ connected: false }, { status: 401 });

  const status = await getConnectionStatus(user.id);
  return NextResponse.json(status);
}
