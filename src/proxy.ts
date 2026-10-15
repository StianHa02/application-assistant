import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/session-cookie";

// Optimistic check only: send visitors without a session cookie to /login.
// The real authorization happens in the Data Access Layer (src/lib/auth.ts).
const PROTECTED = ["/dashboard", "/analyses", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/analyses/:path*", "/settings/:path*"],
};
