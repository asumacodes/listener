import { consumeShipToken } from "@/lib/feedback-prompts/shipToken";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ token: string }> };

const htmlResponse = (html: string, status: number) =>
  new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

const shell = (bodyInner: string): string =>
  `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Murmur</title></head>
<body style="font-family:ui-sans-serif,system-ui;max-width:34rem;margin:4rem auto;padding:0 1.25rem;color:#1a1a1a">${bodyInner}</body></html>`;

const confirmHtml = (token: string): string =>
  shell(`
  <h1 style="font-size:1.5rem;font-weight:600">Did this idea ship?</h1>
  <form method="POST" action="/api/ship/${encodeURIComponent(token)}" style="display:flex;gap:.75rem;margin-top:1.5rem">
    <button name="answer" value="yes" style="padding:.7rem 1.4rem;border:0;border-radius:.6rem;background:#1a1a1a;color:#fff;font-size:1rem;cursor:pointer">Yes</button>
    <button name="answer" value="not_yet" style="padding:.7rem 1.4rem;border:1px solid #ccc;border-radius:.6rem;background:#fff;color:#1a1a1a;font-size:1rem;cursor:pointer">Not yet</button>
  </form>`);

const thanksHtml = (alreadyUsed: boolean): string => {
  const msg = alreadyUsed
    ? "Thanks — we've already got your answer."
    : "Thanks for letting us know.";
  return shell(
    `<h1 style="font-size:1.5rem;font-weight:600">${msg}</h1><p style="color:#555">You can close this window.</p>`
  );
};

const invalidHtml = (): string =>
  shell(
    `<h1 style="font-size:1.5rem;font-weight:600">This link isn't valid anymore</h1><p style="color:#555">It may have already been used. You can close this window.</p>`
  );

const errorHtml = (): string =>
  shell(
    `<h1 style="font-size:1.5rem;font-weight:600">Something went wrong</h1><p style="color:#555">Please try again in a little while.</p>`
  );

const postgrestCode = (err: unknown): string | undefined => {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }
  return undefined;
};

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  if (!token || token.length < 16 || token.length > 200) {
    return htmlResponse(invalidHtml(), 400);
  }
  return htmlResponse(confirmHtml(token), 200);
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  if (!token) return htmlResponse(invalidHtml(), 400);

  const form = await req.formData().catch(() => null);
  const answer = form?.get("answer");
  if (answer !== "yes" && answer !== "not_yet") {
    return htmlResponse(invalidHtml(), 400);
  }
  const shipped = answer === "yes";

  let result;
  try {
    result = await consumeShipToken(token, shipped);
  } catch (err: unknown) {
    if (postgrestCode(err) === "P0002") return htmlResponse(invalidHtml(), 200);
    return htmlResponse(errorHtml(), 500);
  }

  if (shipped && !result.alreadyUsed && result.runId) {
    const dest = new URL(`/runs/${result.runId}`, req.url);
    return NextResponse.redirect(dest, 303);
  }

  return htmlResponse(thanksHtml(result.alreadyUsed), 200);
}
