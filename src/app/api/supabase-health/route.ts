import { NextResponse } from "next/server";
import { checkSupabaseConnectivity } from "@/lib/supabase-health";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await checkSupabaseConnectivity();
  const headers = new Headers();

  headers.set("x-supabase-ok", String(result.ok));

  if (typeof result.reason === "string") {
    headers.set("x-supabase-reason", result.reason);
  }

  if (typeof result.status === "number") {
    headers.set("x-supabase-http-status", String(result.status));
  }

  if (typeof result.urlConfigured === "boolean") {
    headers.set("x-supabase-url-configured", String(result.urlConfigured));
  }

  if (typeof result.anonKeyConfigured === "boolean") {
    headers.set("x-supabase-anon-key-configured", String(result.anonKeyConfigured));
  }

  return NextResponse.json(result, { headers });
}
