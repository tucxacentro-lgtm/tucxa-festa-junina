import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ACCESS_TOKEN_COOKIE, ADMIN_REFRESH_TOKEN_COOKIE } from "@/lib/admin-auth";

const publicAdminPaths = ["/admin/login", "/admin/esqueci-senha", "/admin/redefinir-senha", "/admin/logout"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") || publicAdminPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)?.value;

  // O access token pode expirar antes do refresh token. Se houver refresh token,
  // deixa a rota seguir para o server component tentar recuperar a sessão.
  if (accessToken || refreshToken) {
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
