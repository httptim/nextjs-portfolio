import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET handler to fetch all contact submissions
export async function GET(request: NextRequest) {
  try {
    console.log('Contact Submissions API GET called');
    const session = await getServerSession(authOptions);

    // Only admins should view contact submissions
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to view contact submissions' },
        { status: 403 }
      );
    }

    const submissions = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format date for consistency if needed, although client might format
    const formattedSubmissions = submissions.map(sub => ({
      ...sub,
      date: sub.createdAt.toISOString(), // Ensure a consistent date string format
    }));

    console.log(`Found ${formattedSubmissions.length} contact submissions`);
    return NextResponse.json({ submissions: formattedSubmissions });

  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE handler for contact submissions (by ID)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
   try {
    const id = params.id; // Assuming ID comes from dynamic route [id]
    console.log(`Contact Submissions API DELETE called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to delete contact submissions' },
        { status: 403 }
      );
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    console.log('Deleted contact submission:', id);
    return NextResponse.json({ message: 'Contact submission deleted successfully' }, { status: 200 });

  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record to delete not found
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Not Found', details: 'Contact submission with the specified ID not found.' },
          { status: 404 }
        );
      }
    }
    console.error('Error deleting contact submission:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST handler to mark a submission as read (optional, client might handle this)
export async function POST(request: NextRequest, { params }: { params: { id: string, action?: string } }) {
  try {
    const id = params.id;
    const action = params.action; // Check if URL is like /api/contact-submissions/[id]/read

    // This assumes a route structure like /api/contact-submissions/[id]/[action]
    // If only marking as read, might be simpler as PUT /api/contact-submissions/[id]
    if (action !== 'read') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    console.log(`Contact Submissions API POST called for ID: ${id}, Action: ${action}`);
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required' },
        { status: 403 }
      );
    }

    const updatedSubmission = await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    });

    console.log('Marked contact submission as read:', id);
    return NextResponse.json({ submission: updatedSubmission });

  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
    }
    console.error('Error marking contact submission as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 