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

// POST handler REMOVED from this static route file 