import type { PipelineStage, PipelineStatus } from "@/types/pipeline";
import type { RunResults } from "@/types/run-results";

export type M1CardId =
  | "transcript"
  | "competitor"
  | "prd"
  | "brand"
  | "engineering"
  | "roadmap"
  | "jira"
  | "confluence";

export type M1CardState =
  | "pending"
  | "loading"
  | "failed"
  | "empty"
  | "populated";

export type IdeaRunSummary = {
  id: string;
  status: PipelineStatus;
  currentStage: PipelineStage | null;
  createdAt: string;
  retention: RunRetention | null;
};

export type RunRetention = {
  retentionTier: "default" | "extended" | string;
  expiresAt: string | null;
};

export type IdeaDetailProject = {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
};

export type IdeaDetailRecording = {
  id: string;
  title: string;
  transcription: string;
  language: string | null;
  durationSeconds: number;
  createdAt: string;
  signedUrl: string | null;
};

export type IdeaDetailData = {
  recording: IdeaDetailRecording;
  project: IdeaDetailProject;
  runs: IdeaRunSummary[];
  latestRun: IdeaRunSummary | null;
  selectedRunId: string | null;
  latestRunResults: RunResults | null;
  latestRunRetention: RunRetention | null;
  resultsExpired: boolean;
  inGracePeriod: boolean;
  graceDaysRemaining: number;
};
