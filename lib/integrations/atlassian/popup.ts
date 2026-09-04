/** Same OAuth entry the capture gate uses — popup with full-page fallback. */
export const openAtlassianOAuthPopup = (
  context: "pre_run" | "settings" = "pre_run"
): void => {
  const popup = window.open(
    `/api/integrations/atlassian/start?mode=popup&context=${context}`,
    "atlassian_oauth",
    "width=520,height=720"
  );
  if (!popup || popup.closed) {
    window.location.href = `/api/integrations/atlassian/start?context=${context}`;
  }
};
