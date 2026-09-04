export type FeedbackSubmitPayload = {
  rating: "up" | "neutral" | "down";
  body: string;
  email: string | null;
};

export type PostFeedbackResult = { ok: true; id: string } | { ok: false };

export const postFeedback = async (
  payload: FeedbackSubmitPayload
): Promise<PostFeedbackResult> => {
  let res: Response;
  try {
    res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        pathname: window.location.pathname,
        search: window.location.search,
      }),
    });
  } catch {
    return { ok: false };
  }

  const json: unknown = await res.json().catch(() => null);
  if (
    res.ok &&
    json &&
    typeof json === "object" &&
    "ok" in json &&
    json.ok === true &&
    "id" in json &&
    typeof json.id === "string"
  ) {
    return { ok: true, id: json.id };
  }

  return { ok: false };
};
