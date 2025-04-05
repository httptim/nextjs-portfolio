// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Add this to prevent redirection loops
const MAX_REDIRECTS = 5;
const REDIRECT_COOKIE_NAME = 'next-auth-redirect-count';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`Middleware running for path: ${path}`);
  
  // Check for redirection loops
  const redirectCount = parseInt(request.cookies.get(REDIRECT_COOKIE_NAME)?.value || '0');
  if (redirectCount > MAX_REDIRECTS) {
    // Break the loop by clearing the cookie and allowing the request
    console.log('Detected redirect loop, breaking cycle');
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
                       path.startsWith('/api/debug') ||
                       !path.includes('/dashboard');
  
  console.log(`Path ${path} is public: ${isPublicPath}`);
  
  // Get the session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  console.log(`Token for ${path}: ${token ? `Authenticated as ${token.role}` : 'Not authenticated'}`);
  
  // If on a login page and already logged in, redirect to appropriate dashboard
  if ((path === '/auth/login' || path === '/auth/register') && token) {
    const redirectUrl = token.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/customer';
    console.log(`Redirecting authenticated user to ${redirectUrl}`);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  // If the path doesn't require auth, proceed normally
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check if the user is authenticated for protected routes
  if (!token) {
    console.log(`No token for protected path ${path}, redirecting to login`);
    // Increment redirect count
    const response = NextResponse.redirect(new URL(`/auth/login?callbackUrl=${encodeURIComponent(request.url)}`, request.url));
    response.cookies.set(REDIRECT_COOKIE_NAME, (redirectCount + 1).toString());
    return response;
  }
  
  // User is authenticated, check if they're accessing the correct dashboard
  const accessingAdminPath = path.includes('/dashboard/admin');
  const isAdmin = token.role === 'ADMIN';
  
  if (accessingAdminPath && !isAdmin) {
    console.log('Customer attempting to access admin dashboard, redirecting');
    return NextResponse.redirect(new URL('/dashboard/customer', request.url));
  }
  
  // Allow access to appropriate dashboard
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all paths except static assets, favicon, etc.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
};