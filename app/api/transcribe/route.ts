import { createClient } from "@/lib/supabase/server";
import { transcribe } from "@/lib/transcribe/server";
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

  console.log("[transcribe/route] POST", {
    userId: user.id,
    hasAudio: Boolean(audio),
    audioName: audio && "name" in audio ? audio.name : null,
    audioType: audio && "type" in audio ? audio.type : null,
    audioSize: audio && "size" in audio ? audio.size : null,
  });

  if (!audio) {
    return NextResponse.json(
      { error: "No audio file provided" },
      { status: 400 }
    );
  }

  try {
    const { text, language } = await transcribe(audio);
    console.log("[transcribe/route] ok", {
      textLen: text.length,
      language,
    });
    return NextResponse.json({ text, language });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Whisper request failed";
    console.error("[transcribe/route] error", message, error);
    if (
      message.startsWith("Whisper returned") ||
      message.includes("fetch failed") ||
      message.startsWith("AssemblyAI") ||
      message.startsWith("Missing required environment variable")
    ) {
      return NextResponse.json(
        {
          error:
            "Transcription service unavailable. Please try again in a moment.",
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Transcription endpoint unreachable" },
      { status: 502 }
    );
  }
}
