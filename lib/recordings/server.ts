import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ListRecordingsResult,
  RecordingWithPlayback,
} from "@/types/recording";

const RECORDING_SELECT =
  "id, title, transcription, language, duration_seconds, audio_storage_path, audio_mime_type, created_at";

export const SIGNED_URL_TTL_SECONDS = 3600;

type RowWithStoragePath = { audio_storage_path: string };

export const attachSignedPlaybackUrls = async <T extends RowWithStoragePath>(
  supabase: SupabaseClient,
  rows: T[]
): Promise<(T & { signedUrl: string | null })[]> =>
  Promise.all(
    rows.map(async (row) => {
      const { data } = await supabase.storage
        .from("recordings")
        .createSignedUrl(row.audio_storage_path, SIGNED_URL_TTL_SECONDS);
      return { ...row, signedUrl: data?.signedUrl ?? null };
    })
  );

export const listRecordingsWithSignedUrls =
  async (): Promise<ListRecordingsResult> => {
    const supabase = await createClient();

    const { data: recordings, error } = await supabase
      .from("recordings")
      .select(RECORDING_SELECT)
      .order("created_at", { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    const withPlayback: RecordingWithPlayback[] =
      await attachSignedPlaybackUrls(supabase, recordings ?? []);

    return { data: withPlayback, error: null };
  };
