import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.redirect(new URL("/minha-compra", request.url));
  }

  return NextResponse.redirect(new URL(`/minha-compra/${encodeURIComponent(code)}`, request.url));
}
