import { createClient } from "@/lib/supabase/client";
import type { ProjectColor } from "@/lib/palette";

export type Project = {
  id: string;
  name: string;
  color: ProjectColor;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type ProjectWithCount = Project & { recording_count: number };

type ProjectRowWithRecordingCount = Project & {
  recordings: { count: number }[];
};

// --- Reads ---

/** All projects for the current user, default first, then alphabetical. */
export const listProjects = async (): Promise<Project[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, color, is_default, created_at, updated_at")
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return (data ?? []) as Project[];
};

/** Projects with recording counts — one query via inline aggregate. */
export const listProjectsWithCounts = async (): Promise<ProjectWithCount[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, name, color, is_default, created_at, updated_at, recordings(count)"
    )
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return (data ?? []).map((row) => {
    const { recordings, ...rest } = row as ProjectRowWithRecordingCount;
    return {
      ...rest,
      recording_count: recordings?.[0]?.count ?? 0,
    } as ProjectWithCount;
  });
};

export const getProject = async (id: string): Promise<Project | null> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, color, is_default, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load project: ${error.message}`);
  return (data as Project) ?? null;
};

// --- Writes ---

export const createProject = async (
  name: string,
  color: ProjectColor
): Promise<Project> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name: name.trim(), color, is_default: false })
    .select("id, name, color, is_default, created_at, updated_at")
    .single();
  if (error) throw new Error(`Failed to create project: ${error.message}`);
  return data as Project;
};

export const renameProject = async (
  id: string,
  name: string
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from("projects")
    .update({ name: name.trim() })
    .eq("id", id);
  if (error) throw new Error(`Failed to rename project: ${error.message}`);
};

export const recolorProject = async (
  id: string,
  color: ProjectColor
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from("projects")
    .update({ color })
    .eq("id", id);
  if (error) throw new Error(`Failed to recolor project: ${error.message}`);
};

/**
 * Delete a project. Recordings move to the user's default project first
 * (recordings.project_id is NOT NULL with ON DELETE RESTRICT).
 * The default ("Uncategorised") project cannot be deleted.
 */
export const deleteProject = async (id: string): Promise<void> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: def, error: defErr } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .single();
  if (defErr || !def) throw new Error("Default project missing");
  if (def.id === id) throw new Error("The default project can't be deleted");

  const { error: moveErr } = await supabase
    .from("recordings")
    .update({ project_id: def.id })
    .eq("project_id", id);
  if (moveErr) throw new Error(`Failed to move recordings: ${moveErr.message}`);

  const { error: delErr } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);
  if (delErr) throw new Error(`Failed to delete project: ${delErr.message}`);
};

// --- Assignment ---

export const assignRecordingToProject = async (
  recordingId: string,
  projectId: string
): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from("recordings")
    .update({ project_id: projectId })
    .eq("id", recordingId);
  if (error) throw new Error(`Failed to assign recording: ${error.message}`);
};
