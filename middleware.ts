// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/auth/login' || 
                       path === '/auth/register' || 
                       path === '/' ||
                       path.startsWith('/api/auth') ||
                       !path.includes('/dashboard');
  
  const isApiPath = path.startsWith('/api');
  
  // Get the session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // If the path doesn't require auth, or if it's a public API endpoint, proceed normally
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check if the user is authenticated
  if (!token) {
    // If accessing a protected page without being logged in, redirect to login
    // Store the current URL to redirect back after login
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(request.url)}`, request.url));
  }
  
  // Role-based access control for dashboard routes
  const isAdminPath = path.includes('/dashboard/admin');
  const isCustomerPath = path.includes('/dashboard/customer');
  
  if (isAdminPath && token.role !== 'ADMIN') {
    // Redirect non-admin users trying to access admin routes
    return NextResponse.redirect(new URL('/dashboard/customer', request.url));
  }
  
  if (isCustomerPath && token.role !== 'CUSTOMER' && token.role !== 'ADMIN') {
    // If somehow user has an invalid role, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all paths except static assets, favicon, etc.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};