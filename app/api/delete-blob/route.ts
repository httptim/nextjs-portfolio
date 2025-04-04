// app/api/delete-blob/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the URL from the request body
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Delete from Vercel Blob
    await del(url);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}