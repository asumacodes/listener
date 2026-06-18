// app/api/integrations/atlassian/disconnect/route.ts
// Hard-delete the connection (removes encrypted tokens immediately). Best-effort
// Atlassian revocation is a future enhancement; deletion is the security action.

import { deleteConnection } from "@/lib/integrations/atlassian/connection-store";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  await deleteConnection(user.id);
  return NextResponse.json({ ok: true });
}
