import { createClient } from "@/lib/supabase/server";
import type {
  ListRecordingsResult,
  RecordingWithPlayback,
} from "@/types/recording";

const RECORDING_SELECT =
  "id, title, transcription, language, duration_seconds, audio_storage_path, audio_mime_type, created_at";

const SIGNED_URL_TTL_SECONDS = 3600;

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

    const withPlayback: RecordingWithPlayback[] = await Promise.all(
      (recordings ?? []).map(async (r) => {
        const { data } = await supabase.storage
          .from("recordings")
          .createSignedUrl(r.audio_storage_path, SIGNED_URL_TTL_SECONDS);
        return { ...r, signedUrl: data?.signedUrl ?? null };
      })
    );

    return { data: withPlayback, error: null };
  };
