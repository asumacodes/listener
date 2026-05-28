export type SearchResult = {
  id: string;
  title: string;
  transcription: string | null;
  language: string | null;
  duration_seconds: number;
  project_id: string;
  created_at: string;
  rank: number;
};
