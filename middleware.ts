// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Add this to prevent redirection loops
const MAX_REDIRECTS = 5;
const REDIRECT_COOKIE_NAME = 'next-auth-redirect-count';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check for redirection loops
  const redirectCount = parseInt(request.cookies.get(REDIRECT_COOKIE_NAME)?.value || '0');
  if (redirectCount > MAX_REDIRECTS) {
    // Break the loop by clearing the cookie and allowing the request
    const response = NextResponse.next();
    response.cookies.delete(REDIRECT_COOKIE_NAME);
    return response;
  }
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/auth/login' || 
                       path === '/auth/register' || 
                       path === '/' ||
                       path.startsWith('/api/auth') || 
                       path.includes('/auth/error') ||
                       !path.includes('/dashboard');
  
  // Get the session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // If on a login page and already logged in, redirect to appropriate dashboard
  if ((path === '/auth/login' || path === '/auth/register') && token) {
    const redirectUrl = token.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/customer';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  // If the path doesn't require auth, proceed normally
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check if the user is authenticated for protected routes
  if (!token) {
    // Increment redirect count
    const response = NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(request.url)}`, request.url));
    response.cookies.set(REDIRECT_COOKIE_NAME, (redirectCount + 1).toString());
    return response;
  }
  
  // User is authenticated, clear redirect counter
  const response = NextResponse.next();
  response.cookies.delete(REDIRECT_COOKIE_NAME);
  
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

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all paths except static assets, favicon, etc.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};