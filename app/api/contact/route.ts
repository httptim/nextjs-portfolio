// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { ContactService } from '@/lib/services/contact-service';

// Get contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    
    // Handle read filter
    let read: boolean | undefined = undefined;
    const readParam = searchParams.get('read');
    if (readParam === 'true') read = true;
    if (readParam === 'false') read = false;
    
    // Get contact submissions
    const result = await ContactService.getContactSubmissions({
      page,
      limit,
      search,
      read,
    });
    
    // Format dates for JSON response
    const formattedSubmissions = result.submissions.map(submission => ({
      ...submission,
      createdAt: submission.createdAt.toISOString(),
    }));
    
    return NextResponse.json({
      submissions: formattedSubmissions,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error in contact API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new contact submission (public)
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated - we'll associate the submission with their account if they are
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Create the contact submission
    const submission = await ContactService.createContactSubmission({
      name: body.name,
      email: body.email,
      message: body.message,
      userId: userId || undefined,
    });
    
    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        createdAt: submission.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating contact submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}