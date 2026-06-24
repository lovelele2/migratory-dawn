import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { applyDemoAction } from "@/lib/demo-server-store";
import { handleAppAction, loadAppState } from "@/lib/app-state";

export const dynamic = "force-dynamic";

const ACCESS_TOKEN_COOKIE = "md-supabase-access-token";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const state = await loadAppState(accessToken);
  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    const state = applyDemoAction(body);
    return NextResponse.json(state);
  }

  const state = await handleAppAction(body, accessToken);
  return NextResponse.json(state);
}
