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
    const { recordings, ...rest } =
      row as unknown as ProjectRowWithRecordingCount;
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

export const updateProject = async (
  id: string,
  name: string,
  color: ProjectColor
): Promise<void> => {
  await renameProject(id, name);
  await recolorProject(id, color);
};

export const deleteProject = async (id: string): Promise<void> => {
  const response = await fetch(
    `/api/murmur/projects/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (body?.error === "cannot_delete_default_project") {
      throw new Error("The default project can't be deleted");
    }

    throw new Error(
      `Failed to delete project: ${body?.error ?? response.statusText}`
    );
  }
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
