import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ACCESS_TOKEN_COOKIE, ADMIN_REFRESH_TOKEN_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  cookieStore.delete(ADMIN_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(ADMIN_REFRESH_TOKEN_COOKIE);

  return NextResponse.redirect(new URL("/admin/login", request.url));
}
