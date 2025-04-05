import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    
    // Return session info
    return NextResponse.json({
      authenticated: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          role: session.user?.role,
        },
        expires: session.expires
      } : null,
      cookies: request.cookies.getAll().map(c => ({ name: c.name })), // Don't send values for security
      headers: Object.fromEntries(request.headers)
    });
  } catch (error) {
    console.error('Error in debug session API route:', error);
    return NextResponse.json(
      { 
        error: 'Error checking session',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 