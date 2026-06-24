import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim() || "";

  if (!email) {
    return NextResponse.json({ ok: false, reason: "missing_email" }, { status: 400 });
  }

  const result = await requestOtp(email);
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}
