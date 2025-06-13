import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Role-based route access map
const roleAccessMap: Record<number, string[]> = {
  1: ["/admin"], // Admin
  2: ["/user"],  // Regular User
};

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname === "/" || pathname === "/register") {
      if (token) {
        const role = token.role as number;
        if (role === 1) return NextResponse.redirect(new URL("/admin/dashboard", req.url));
        if (role === 2) return NextResponse.redirect(new URL("/user/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (!token || typeof token.role !== "number") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    const role = token.role;
    const allowedPrefixes = roleAccessMap[role] || [];
    const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

// Matcher should include both guest and protected routes
export const config = {
  matcher: [
    "/", "/register", //GUEST ROUTES
    "/admin/:path*", "/user/:path*" // AUTHENTICATED ROUTES
  ],
};
