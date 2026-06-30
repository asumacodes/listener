export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: Table<{
        id: string;
        email: string | null;
        display_name: string | null;
        avatar_url: string | null;
        created_at: string;
        updated_at: string | null;
      }>;
      projects: Table<{
        id: string;
        user_id: string;
        name: string;
        color: string;
        is_default: boolean;
        created_at: string;
        updated_at: string;
      }>;
      recordings: Table<{
        id: string;
        user_id: string;
        project_id: string;
        latest_run_id: string | null;
        title: string;
        transcription: string;
        language: string | null;
        duration_seconds: number;
        audio_storage_path: string;
        audio_mime_type: string;
        created_at: string;
        updated_at: string | null;
      }>;
      pipeline_runs: Table<{
        id: string;
        recording_id: string;
        user_id: string;
        status: "queued" | "running" | "done" | "failed";
        current_stage:
          | "transcribing"
          | "researching"
          | "writing_prd"
          | "designing_brand"
          | "building_board"
          | null;
        jira_project_key: string | null;
        confluence_space_key: string | null;
        cost_usd: number | null;
        retention_tier: string | null;
        expires_at: string | null;
        started_at: string | null;
        completed_at: string | null;
        grace_started_at: string | null;
        created_at: string;
      }>;
      run_events: Table<{
        id: string;
        run_id: string;
        stage:
          | "transcribing"
          | "researching"
          | "writing_prd"
          | "designing_brand"
          | "building_board";
        event: "stage_started" | "stage_done" | "stage_failed";
        detail: string | null;
        created_at: string;
      }>;
      run_results: Table<{
        run_id: string;
        transcript: string | null;
        competitors: Json | null;
        prd: Json | null;
        brand: Json | null;
        engineering: Json | null;
        jira: Json | null;
        confluence: Json | null;
        created_at: string;
        updated_at: string | null;
      }>;
      atlassian_connections: Table<{
        user_id: string;
        cloud_id: string;
        site_url: string;
        scopes: string;
        access_token_enc: string;
        refresh_token_enc: string;
        access_expires_at: string;
        created_at: string;
        updated_at: string | null;
      }>;
      push_subscriptions: Table<{
        endpoint: string;
        user_id: string;
        p256dh: string;
        auth: string;
        user_agent: string | null;
        last_seen_at: string;
        created_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      ensure_user_provisioned: {
        Args: Record<string, never>;
        Returns: void;
      };
      search_recordings: {
        Args: { q: string };
        Returns: {
          id: string;
          title: string;
          transcription: string | null;
          language: string | null;
          duration_seconds: number;
          created_at: string;
          project_id: string;
          rank: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
