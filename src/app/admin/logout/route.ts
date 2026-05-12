import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ACCESS_TOKEN_COOKIE, ADMIN_REFRESH_TOKEN_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth";

function clearCookie(response: NextResponse, name: string) {
  response.cookies.set(name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));

  clearCookie(response, ADMIN_SESSION_COOKIE);
  clearCookie(response, ADMIN_ACCESS_TOKEN_COOKIE);
  clearCookie(response, ADMIN_REFRESH_TOKEN_COOKIE);

  return response;
}
