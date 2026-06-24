import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ACCESS_TOKEN_COOKIE = "md-supabase-access-token";
const REFRESH_TOKEN_COOKIE = "md-supabase-refresh-token";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
