import { createClient } from "@/lib/supabase/server";
import { transcribeWithWhisper } from "@/lib/whisper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const audio = formData.get("audio") as File;

  if (!audio) {
    return NextResponse.json(
      { error: "No audio file provided" },
      { status: 400 }
    );
  }

  try {
    const { text, language } = await transcribeWithWhisper(audio);
    return NextResponse.json({ text, language });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Whisper request failed";
    if (
      message.startsWith("Whisper returned") ||
      message.includes("fetch failed")
    ) {
      return NextResponse.json(
        {
          error:
            "Transcription service unavailable. Ensure your Whisper server is running at NEXT_PUBLIC_WHISPER_ENDPOINT.",
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Whisper endpoint unreachable" },
      { status: 502 }
    );
  }
}
