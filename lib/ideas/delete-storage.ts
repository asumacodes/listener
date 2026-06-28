import type { SupabaseClient } from "@supabase/supabase-js";

const RECORDINGS_BUCKET = "recordings";
const STORAGE_PAGE_SIZE = 100;
const STORAGE_REMOVE_CHUNK_SIZE = 100;

export type StorageDeleteResult = {
  removed: string[];
  failed: boolean;
  error?: string;
};

export async function deleteRecordingAudio(
  supabase: SupabaseClient,
  audioStoragePath: string
): Promise<StorageDeleteResult> {
  if (!audioStoragePath) {
    return { removed: [], failed: false };
  }

  const { data, error } = await supabase.storage
    .from(RECORDINGS_BUCKET)
    .remove([audioStoragePath]);

  if (error) {
    return { removed: [], failed: true, error: error.message };
  }

  return { removed: (data ?? []).map((object) => object.name), failed: false };
}

export async function deleteAllUserAudio(
  supabase: SupabaseClient,
  userId: string
): Promise<StorageDeleteResult> {
  const prefix = userId;
  const allPaths: string[] = [];
  const removed: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from(RECORDINGS_BUCKET)
      .list(prefix, { limit: STORAGE_PAGE_SIZE, offset });

    if (error) {
      return { removed, failed: true, error: error.message };
    }
    if (!data || data.length === 0) break;

    allPaths.push(...data.map((object) => `${prefix}/${object.name}`));

    if (data.length < STORAGE_PAGE_SIZE) break;
    offset += STORAGE_PAGE_SIZE;
  }

  for (let i = 0; i < allPaths.length; i += STORAGE_REMOVE_CHUNK_SIZE) {
    const batch = allPaths.slice(i, i + STORAGE_REMOVE_CHUNK_SIZE);
    const { data, error } = await supabase.storage
      .from(RECORDINGS_BUCKET)
      .remove(batch);

    if (error) {
      return { removed, failed: true, error: error.message };
    }

    removed.push(...(data ?? []).map((object) => object.name));
  }

  return { removed, failed: false };
}
