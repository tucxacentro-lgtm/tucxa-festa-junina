import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login") || pathname.startsWith("/admin/logout")) {
    return NextResponse.next();
  }

  const expectedSecret = process.env.ADMIN_SESSION_SECRET;
  const sessionValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (expectedSecret && sessionValue === expectedSecret) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
