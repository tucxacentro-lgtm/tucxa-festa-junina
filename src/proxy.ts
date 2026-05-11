import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/admin-auth";

const publicAdminPaths = ["/admin/login", "/admin/esqueci-senha", "/admin/redefinir-senha", "/admin/logout"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || publicAdminPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
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
