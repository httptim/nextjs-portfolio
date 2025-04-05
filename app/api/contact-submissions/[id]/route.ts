import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// DELETE handler for a specific contact submission by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
   try {
    const id = params.id;
    console.log(`Contact Submissions API DELETE called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to delete contact submissions' },
        { status: 403 }
      );
    }

    // Check if the submission exists before attempting to delete
    const submissionExists = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!submissionExists) {
      return NextResponse.json(
        { error: 'Not Found', details: 'Contact submission with the specified ID not found.' },
        { status: 404 }
      );
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    console.log('Deleted contact submission:', id);
    return NextResponse.json({ message: 'Contact submission deleted successfully' }, { status: 200 });

  } catch (error) {
     // Catch potential errors, though existence check reduces P2025 likelihood
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

// PATCH handler to update a specific contact submission (e.g., mark as read)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    console.log(`Contact Submissions API PATCH called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to update contact submissions' },
        { status: 403 }
      );
    }

    // Expecting body like { read: true } or { read: false }
    const body = await request.json();
    const readStatus = body.read;

    if (typeof readStatus !== 'boolean') {
       return NextResponse.json(
        { error: 'Bad Request', details: 'Invalid request body. Expected { read: boolean }.' },
        { status: 400 }
      );
    }

    const updatedSubmission = await prisma.contactMessage.update({
      where: { id },
      data: { read: readStatus },
    });

    console.log(`Updated read status for contact submission ${id} to ${readStatus}`);
    return NextResponse.json({ submission: updatedSubmission });

  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record to update not found
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Not Found', details: 'Contact submission with the specified ID not found.' },
          { status: 404 }
        );
      }
    }
    console.error('Error updating contact submission:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
