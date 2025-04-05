// app/api/contact/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { ContactService } from '@/lib/services/contact-service';

interface Params {
  params: {
    id: string;
  };
}

// Get a specific contact submission (admin only)
export async function GET(request: NextRequest, { params }: Params) {
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
    
    // Get the contact submission
    const submission = await ContactService.getContactSubmissionById(params.id);
    
    if (!submission) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      );
    }
    
    // Format dates for JSON response
    const formattedSubmission = {
      ...submission,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
    };
    
    return NextResponse.json({ submission: formattedSubmission });
  } catch (error) {
    console.error('Error in contact API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update read status (admin only)
export async function PATCH(request: NextRequest, { params }: Params) {
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
    
    // Parse the request body
    const body = await request.json();
    
    // Validate read field
    if (body.read === undefined) {
      return NextResponse.json(
        { error: 'Read status is required' },
        { status: 400 }
      );
    }
    
    // Update the read status
    await ContactService.updateReadStatus(params.id, body.read);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating read status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a contact submission (admin only)
export async function DELETE(request: NextRequest, { params }: Params) {
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
    
    // Delete the contact submission
    await ContactService.deleteContactSubmission(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}