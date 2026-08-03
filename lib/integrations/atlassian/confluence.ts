// lib/integrations/atlassian/confluence.ts
// Confluence Cloud REST helpers. SERVER-ONLY — uses OAuth access tokens.

export type ConfluencePageBodyOk = {
  status: "ok";
  pageId: string;
  title: string;
  storageHtml: string;
};

export type ConfluencePageBodyError = {
  status: "unauthorized" | "not_found" | "upstream";
  message?: string;
};

export type ConfluencePageBodyResult =
  | ConfluencePageBodyOk
  | ConfluencePageBodyError;

type FetchConfluencePageBodyInput = {
  cloudId: string;
  accessToken: string;
  pageId: string;
};

/**
 * Fetch a Confluence page body in storage format (HTML/XML).
 * Uses Confluence REST v2 via the Atlassian gateway.
 */
export const fetchConfluencePageBody = async ({
  cloudId,
  accessToken,
  pageId,
}: FetchConfluencePageBodyInput): Promise<ConfluencePageBodyResult> => {
  const url = new URL(
    `https://api.atlassian.com/ex/confluence/${cloudId}/wiki/api/v2/pages/${encodeURIComponent(pageId)}`
  );
  url.searchParams.set("body-format", "storage");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch (err) {
    return {
      status: "upstream",
      message: err instanceof Error ? err.message : "network_error",
    };
  }

  if (res.status === 401 || res.status === 403) {
    return { status: "unauthorized" };
  }
  if (res.status === 404) {
    return { status: "not_found" };
  }
  if (!res.ok) {
    return {
      status: "upstream",
      message: `confluence_${res.status}`,
    };
  }

  const data = (await res.json()) as {
    id?: string;
    title?: string;
    body?: { storage?: { value?: string } };
  };

  const storageHtml = data.body?.storage?.value ?? "";
  if (!storageHtml) {
    return { status: "upstream", message: "empty_body" };
  }

  return {
    status: "ok",
    pageId: String(data.id ?? pageId),
    title: data.title ?? "",
    storageHtml,
  };
};
