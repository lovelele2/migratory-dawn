import { NextResponse } from "next/server";
import { getWindySunriseSnapshot } from "@/lib/windy";
import { getFallbackCandidates } from "@/lib/sunrise";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getWindySunriseSnapshot();

  if (snapshot) {
    return NextResponse.json({
      source: "windy",
      cameras: [snapshot.currentCamera, ...snapshot.queue],
    });
  }

  return NextResponse.json({
    source: "fallback",
    cameras: getFallbackCandidates(),
  });
}
