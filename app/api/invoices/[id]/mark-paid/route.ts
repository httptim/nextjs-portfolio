import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// POST handler to mark a specific invoice as PAID
export async function POST(request: NextRequest, context: any) { // Use context: any workaround
   try {
    const id = context.params.id; // Get invoice ID from dynamic route
    console.log(`Invoices Mark Paid API POST called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    // Ensure user is admin
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to update invoice status' },
        { status: 403 }
      );
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { 
        status: 'PAID', // Set status to PAID
        // Optionally, add payment details if needed/provided in request body
      },
    });

    console.log(`Marked invoice ${id} as PAID`);
    // Return the updated invoice or just a success message
    // Client-side code optimistically updates, so success message is fine
    return NextResponse.json({ message: 'Invoice marked as paid successfully' }, { status: 200 }); 

  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record to update not found
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Not Found', details: 'Invoice with the specified ID not found.' },
          { status: 404 }
        );
      }
      console.error('Prisma Error updating invoice status:', error);
       return NextResponse.json(
          { error: 'Database Error', details: 'Failed to update invoice status due to database issue.' },
          { status: 400 }
        );
    }
    console.error('Error marking invoice as paid:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 