import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard", "/organization", "/assets", "/allocation",
  "/booking", "/maintenance", "/audit", "/reports", "/notifications",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token =
    request.cookies.get("assetflow_token")?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage  = pathname.startsWith("/auth/");

  // Unauthenticated → redirect to login, remember where they came from
  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → don't show login/signup
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
