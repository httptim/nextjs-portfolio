// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Store the user's current URL to redirect back after login
  const requestUrl = new URL(request.url);

  // Check if this is a dashboard URL
  if (requestUrl.pathname.includes('/dashboard')) {
    // In a real app, you would check for a server-side session or token
    // Since we're using localStorage for demo purposes, we can't check in middleware
    // Instead, we'll return the unmodified request and handle auth checking in the client components

    // NOTE: In a production app, you should NOT rely on client-side auth checks
    // You would use a server-side session, JWT verification, or similar techniques
    return NextResponse.next();
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*'
  ],
};