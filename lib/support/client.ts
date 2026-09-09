export type SupportCategory = "bug" | "question" | "feature" | "other";

export type SupportSubmitPayload = {
  subject: string;
  category: SupportCategory;
  message: string;
  email: string;
};

export type PostSupportTicketResult = { ok: true; id: string } | { ok: false };

export const postSupportTicket = async (
  payload: SupportSubmitPayload
): Promise<PostSupportTicketResult> => {
  let res: Response;
  try {
    res = await fetch("/api/support", {
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
