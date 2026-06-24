import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/supabase-server";
import { verifyOrCreateProfile } from "@/lib/app-state";

export const dynamic = "force-dynamic";

const ACCESS_TOKEN_COOKIE = "md-supabase-access-token";
const REFRESH_TOKEN_COOKIE = "md-supabase-refresh-token";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; token?: string; nickname?: string };
  const email = body.email?.trim() || "";
  const token = body.token?.trim() || "";
  const nickname = body.nickname?.trim() || "";

  if (!email || !token) {
    return NextResponse.json({ ok: false, reason: "missing_credentials" }, { status: 400 });
  }

  const result = await verifyOtp(email, token);
  if (!result.ok || !result.data) {
    return NextResponse.json(result, { status: result.status || 401 });
  }

  const response = NextResponse.json({
    ok: true,
    user: result.data.user,
  });

  response.cookies.set(ACCESS_TOKEN_COOKIE, result.data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  if (result.data.refresh_token) {
    response.cookies.set(REFRESH_TOKEN_COOKIE, result.data.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  try {
    await verifyOrCreateProfile(result.data.access_token, result.data.user, nickname);
  } catch {
    // Profile upsert failures should not block auth completion during MVP fallback.
  }

  return response;
}
