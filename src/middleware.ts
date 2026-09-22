import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth-edge";

const ADMIN_ROLES = new Set([
  "SUPER_ADMIN",
  "FINANCE",
  "INFLUENCER_MANAGER",
  "ANALYST",
]);

function nextWithPathname(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isPublic = pathname === "/login" || pathname.startsWith("/api/auth") || pathname.startsWith("/r/");
  if (isPublic) return nextWithPathname(req);

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  if (pathname.startsWith("/admin") && !ADMIN_ROLES.has(role)) {
    return NextResponse.redirect(new URL("/influencer", req.url));
  }

  if (pathname.startsWith("/influencer") && role !== "INFLUENCER") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  if (pathname === "/") {
    const dest = role === "INFLUENCER" ? "/influencer" : "/admin";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return nextWithPathname(req);
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
