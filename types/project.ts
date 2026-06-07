import type { ProjectColor } from "@/lib/palette";
import type { Project } from "@/lib/projects";
import type { ProjectWithRollup } from "@/lib/projects/rollup";

export type ProjectFormMode =
  | { kind: "create"; context: "list" | "transcription" }
  | { kind: "edit"; initialName: string; initialColor: ProjectColor };

export type ProjectPickerViewProps = {
  projects: Project[];
  selectedId: string | null;
  isSaving: boolean;
  error: string | null;
  savedTo: string | null;
  onSelect: (projectId: string) => void;
  createSheetOpen: boolean;
  onOpenCreateSheet: () => void;
  onCloseCreateSheet: () => void;
  onCreateAndAssign: (name: string, color: ProjectColor) => Promise<void>;
};

export type UseProjectPickerOptions = {
  recordingId: string;
  currentProjectId: string | null;
  enabled?: boolean;
  onAssigned?: (projectId: string, isDefault: boolean) => void;
};

export type ProjectDeleteTarget = {
  id: string;
  name: string;
  recordingCount: number;
};

export type ProjectListFormState =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; project: ProjectWithRollup };

export type ProjectListViewProps = {
  projects: ProjectWithRollup[];
  loading: boolean;
  error: string | null;
  form: ProjectListFormState;
  formOpen: boolean;
  formMode: ProjectFormMode;
  formResetKey: string;
  deleteTarget: ProjectDeleteTarget | null;
  isDeleting: boolean;
  onOpenCreate: () => void;
  onCloseForm: () => void;
  onSubmitForm: (name: string, color: ProjectColor) => Promise<void>;
  onOpenEdit: (project: ProjectWithRollup) => void;
  onRequestDeleteFromEdit: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => Promise<void>;
};

export type ProjectDetailHeader = {
  id: string;
  name: string;
  color: string;
};

export type ProjectDetailRecording = {
  id: string;
  title: string;
  transcription: string;
  language: string | null;
  duration_seconds: number;
  created_at: string;
  signedUrl: string | null;
  latestRunStatus: import("@/types/pipeline").PipelineStatus | null;
};

export type ProjectDetailViewProps = {
  project: ProjectDetailHeader;
  recordings: ProjectDetailRecording[];
};
