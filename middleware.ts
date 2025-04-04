import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

import { prisma } from "./lib/prisma";

export default withAuth(
  function middleware(req) {
    const token = req.nextAuth.token;
    const path = req.nextUrl.pathname;

    // Protect admin routes
    if (path.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Protect customer routes
    if (path.startsWith("/dashboard/customer") && token?.role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
