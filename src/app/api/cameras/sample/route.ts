import { NextResponse } from "next/server";
import { getCurrentSunriseSnapshot, getFallbackCandidates } from "@/lib/sunrise";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getCurrentSunriseSnapshot();

  return NextResponse.json({
    source: snapshot.source.label,
    currentCamera: snapshot.currentCamera,
    queue: snapshot.queue.length > 0 ? snapshot.queue : getFallbackCandidates().slice(1),
    note: snapshot.note,
  });
}
