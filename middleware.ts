import { withAuth } from "next-auth/middleware";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const role = req.nextauth.token?.role;
    const pathname = req.nextUrl.pathname;

    // Protect dashboard route for admin only
    if (pathname === "/dashboard") {
      if (role !== 1) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Guest-only route: if authenticated user tries to access login page (/)
    if (pathname === "/") {
      if (req.nextauth.token) {
        // Redirect authenticated user to dashboard (or any other page)
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Allow all other requests
    return NextResponse.next();
  },
  {
    callbacks: {
      // First layer: only allow if token exists (authenticated) for protected routes
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard", "/admin/:path*", "/user/:path*"], // include "/" for guest check
};
