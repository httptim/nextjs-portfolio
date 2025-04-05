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

// DELETE handler REMOVED from this static route file

// POST handler to create a new contact submission
export async function POST(request: NextRequest) {
  try {
    console.log('Contact Submissions API POST called');
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }
    
    // Basic email validation (consider a more robust library if needed)
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(body.email)) {
       return NextResponse.json(
        { error: 'Invalid Email', details: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Optional: Try to link to an existing user based on email
    const user = await prisma.user.findUnique({ where: { email: body.email } });

    const newSubmission = await prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email,
        message: body.message,
        read: false,
        // Link to user if found, otherwise leave userId null
        ...(user && { userId: user.id }), 
      },
    });

    console.log('Created new contact submission:', newSubmission.id);
    // Return success response (maybe the created object, or just success)
    return NextResponse.json({ message: 'Submission received successfully', submissionId: newSubmission.id }, { status: 201 }); 

  } catch (error) {
    console.error('Error creating contact submission:', error);
    // Avoid leaking detailed errors to the public contact form
    return NextResponse.json(
      { error: 'Internal server error', message: 'Could not process your submission at this time.' }, 
      { status: 500 }
    );
  }
} 