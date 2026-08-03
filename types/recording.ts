export type RecordingRow = {
  id: string;
  title: string;
  transcription: string;
  language: string | null;
  duration_seconds: number;
  audio_storage_path: string;
  audio_mime_type: string;
  created_at: string;
};

export type RecordingWithPlayback = RecordingRow & {
  signedUrl: string | null;
};

export type SaveRecordingArgs = {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
  transcription: string;
  language: string | null;
  /** When set, recording is saved into this project instead of the default. */
  projectId?: string;
  /** AssemblyAI only — omitted/null on whisper/dev. */
  assemblyaiUsd?: number;
  assemblyaiDurationSeconds?: number;
  transcriptReadyAt?: string;
  /** Client stamp immediately before transcribeAudio (confirm-to-ready latency). */
  transcriptionStartedAt?: string;
};

export type SaveRecordingResult = {
  recordingId: string;
  projectId: string;
  title: string;
};

export type ListRecordingsResult =
  | {
      data: RecordingWithPlayback[];
      error: null;
    }
  | {
      data: null;
      error: string;
    };
