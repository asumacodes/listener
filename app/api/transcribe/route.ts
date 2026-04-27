import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audio = formData.get("audio") as File;

  if (!audio) {
    return NextResponse.json(
      { error: "No audio file provided" },
      { status: 400 }
    );
  }

  const whisperForm = new FormData();
  whisperForm.append("audio_file", audio, audio.name);

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_WHISPER_ENDPOINT!, {
      method: "POST",
      body: whisperForm,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Whisper returned ${response.status}` },
        { status: 502 }
      );
    }

    const result = await response.json();
    return NextResponse.json({
      text: result.text ?? "",
      language: result.language ?? "",
    });
  } catch {
    return NextResponse.json(
      { error: "Whisper endpoint unreachable" },
      { status: 502 }
    );
  }
}
