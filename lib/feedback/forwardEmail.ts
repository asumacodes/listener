import { Resend } from "resend";

type ForwardFeedbackEmailParams = {
  feedbackId: string;
  userId: string;
  rating: "up" | "neutral" | "down";
  body: string;
  email: string | null;
  route: string;
  runId: string | null;
};

export const forwardFeedbackEmail = async (
  params: ForwardFeedbackEmailParams
): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "[feedback] RESEND_API_KEY missing; email skipped",
      params.feedbackId
    );
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const runLine = params.runId
      ? `Run: ${params.runId}\n`
      : "Run: — (none on screen)\n";

    const { error } = await resend.emails.send({
      from: "Murmur feedback <feedback@send.trymurmur.studio>",
      to: "hey@trymurmur.studio",
      replyTo: params.email ?? undefined,
      subject: `Feedback: ${params.rating} — ${params.route}`,
      text:
        `Rating: ${params.rating}\n` +
        `Route: ${params.route}\n` +
        runLine +
        `Contact: ${params.email ?? "(none given)"}\n` +
        `User: ${params.userId}\n` +
        `Feedback ID: ${params.feedbackId}\n\n` +
        `${params.body}\n`,
    });

    if (error) {
      console.error("[feedback] Resend forward failed (row persisted):", error);
    }
  } catch (err) {
    console.error("[feedback] Resend forward failed (row persisted):", err);
  }
};
