import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;

  return NextResponse.json(
    {
      error: "legacy_recording_delete_route",
      canonical: `/api/murmur/recordings/${encodeURIComponent(id)}`,
    },
    {
      status: 308,
      headers: {
        Location: `/api/murmur/recordings/${encodeURIComponent(id)}`,
      },
    }
  );
}
