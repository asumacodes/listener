import type { ProjectColor } from "@/lib/palette";
import type { Project, ProjectWithCount } from "@/lib/projects";

export type ProjectPickerViewProps = {
  projects: Project[];
  selectedId: string | null;
  isSaving: boolean;
  error: string | null;
  onSelect: (projectId: string) => void;
};

export type UseProjectPickerOptions = {
  recordingId: string;
  currentProjectId: string | null;
  enabled?: boolean;
  onAssigned?: (projectId: string) => void;
};

export type ProjectDeleteTarget = {
  id: string;
  name: string;
  recordingCount: number;
};

export type ProjectListViewProps = {
  projects: ProjectWithCount[];
  loading: boolean;
  error: string | null;
  newName: string;
  newColor: ProjectColor;
  creating: boolean;
  deleteTarget: ProjectDeleteTarget | null;
  isDeleting: boolean;
  onNewNameChange: (value: string) => void;
  onNewColorChange: (color: ProjectColor) => void;
  onCreate: () => void;
  onRename: (id: string, current: string) => void;
  onRequestDelete: (id: string, name: string, count: number) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
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
};

export type ProjectDetailViewProps = {
  project: ProjectDetailHeader;
  recordings: ProjectDetailRecording[];
};
