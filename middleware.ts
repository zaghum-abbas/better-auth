import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth-server";
import type { Session } from "@/types";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const session: Session | null = await auth.api.getSession({
      headers: await headers(),
    });

    const isLoggedIn = !!session?.session;
    const authRoutes = ["/login", "/signup", "/forgot-password"];
    const protectedRoutes = ["/dashboard", "/profile", "/settings", "/plans"];

    if (isLoggedIn && authRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      !isLoggedIn &&
      protectedRoutes.some((route) => pathname.startsWith(route))
    ) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // If there's an error getting session, allow the request to continue
    // The client-side auth check will handle it
    return NextResponse.next();
  }
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/login",
    "/signup",
    "/forgot-password",
    "/dashboard/:path*",
    "/plans",
  ],
};
