import { NextResponse } from "next/server";
import { getCurrentSunriseSnapshot } from "@/lib/sunrise";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getCurrentSunriseSnapshot();
  return NextResponse.json(snapshot);
}
