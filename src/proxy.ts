import { NextRequest, NextResponse } from "next/server";

const ADMIN_ACCESS_TOKEN_COOKIE = "tucxa_admin_access_token";
const ADMIN_REFRESH_TOKEN_COOKIE = "tucxa_admin_refresh_token";
const ADMIN_SESSION_COOKIE = "tucxa_admin_session";

const publicAdminPaths = [
  "/admin/login",
  "/admin/login/persist",
  "/admin/esqueci-senha",
  "/admin/redefinir-senha",
  "/admin/logout",
  "/admin/session-check",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || publicAdminPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const adminSession = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const accessToken = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;

  if (adminSession || accessToken || refreshToken) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
