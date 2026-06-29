import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // KAN-39 / ADR-025(d): only delete non-default projects owned by the caller.
  // RLS scopes the read; the explicit default check gives a clean UX error.
  const { data: target, error: readError } = await supabase
    .from("projects")
    .select("id, is_default")
    .eq("id", projectId)
    .maybeSingle();

  if (readError) {
    return NextResponse.json({ error: "read_failed" }, { status: 500 });
  }
  if (!target) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (target.is_default) {
    return NextResponse.json(
      { error: "cannot_delete_default_project" },
      { status: 409 }
    );
  }

  const { data: defaultProject, error: defaultError } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  if (defaultError) {
    return NextResponse.json(
      { error: "default_lookup_failed" },
      { status: 500 }
    );
  }
  if (!defaultProject) {
    return NextResponse.json({ error: "no_default_project" }, { status: 500 });
  }

  // Reassign first. recordings.project_id is ON DELETE RESTRICT, so deleting a
  // project that still owns recordings must fail instead of orphaning data.
  const { error: reassignError } = await supabase
    .from("recordings")
    .update({ project_id: defaultProject.id })
    .eq("project_id", projectId);

  if (reassignError) {
    return NextResponse.json({ error: "reassign_failed" }, { status: 500 });
  }

  const { error: deleteError, count } = await supabase
    .from("projects")
    .delete({ count: "exact" })
    .eq("id", projectId);

  if (deleteError) {
    return NextResponse.json(
      { error: "project_delete_failed" },
      { status: 500 }
    );
  }
  if (count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    deleted: projectId,
    reassignedTo: defaultProject.id,
  });
}
