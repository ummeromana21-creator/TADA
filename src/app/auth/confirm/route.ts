import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

/** The link in the sign-in email lands here. Handles both Supabase email styles (token_hash or code). */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/app";
  const next = nextParam.startsWith("/") ? nextParam : "/app";
  const supabase = await createClient();
  let ok = false;
  if (token_hash && type) ok = !(await supabase.auth.verifyOtp({ type, token_hash })).error;
  else if (code) ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  const url = request.nextUrl.clone();
  url.search = "";
  url.pathname = ok ? next : "/login";
  if (!ok) url.searchParams.set("error", "That sign-in link didn't work — it may have expired. Ask for a new one.");
  return NextResponse.redirect(url);
}
