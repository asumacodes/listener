import { Resend } from "resend";
import type { SupportCategory } from "@/lib/support/client";

type SendSupportAcknowledgementParams = {
  ticketId: string;
  subject: string;
  category: SupportCategory;
  email: string;
};

export const sendSupportAcknowledgement = async (
  params: SendSupportAcknowledgementParams
): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(
      "[support] RESEND_API_KEY missing; acknowledgement skipped",
      params.ticketId
    );
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Murmur Support <support@trymurmur.studio>",
      to: [params.email],
      bcc: "support@trymurmur.studio",
      subject: `We've got your message: ${params.subject}`,
      text:
        `Hi,\n\n` +
        `We've received your message and we're looking into it. Expect a reply within one business day.\n\n` +
        `Subject: ${params.subject}\n` +
        `Category: ${params.category}\n` +
        `Ticket: ${params.ticketId}\n\n` +
        `— Murmur Support\n`,
    });

    if (error) {
      console.error(
        "[support] Resend acknowledgement failed (row persisted):",
        error
      );
    }
  } catch (err) {
    console.error(
      "[support] Resend acknowledgement failed (row persisted):",
      err
    );
  }
};
