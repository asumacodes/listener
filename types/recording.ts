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
