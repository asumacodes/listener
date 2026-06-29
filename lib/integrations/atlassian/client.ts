"use client";

export type AtlassianStatus = {
  connected: boolean;
  siteUrl?: string;
};

export const getAtlassianStatus = async (): Promise<AtlassianStatus> => {
  const response = await fetch("/api/integrations/atlassian/status");
  if (!response.ok) {
    throw new Error("atlassian_status_failed");
  }
  return (await response.json()) as AtlassianStatus;
};

export const disconnectAtlassian = async (): Promise<void> => {
  const response = await fetch("/api/integrations/atlassian/disconnect", {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error("atlassian_disconnect_failed");
  }
};
