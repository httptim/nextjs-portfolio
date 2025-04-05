import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// DELETE handler for a specific invoice by ID
export async function DELETE(request: NextRequest, context: any) { // Use context: any workaround
   try {
    const id = context.params.id;
    console.log(`Invoices API DELETE called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    // Ensure user is admin
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to delete invoices' },
        { status: 403 }
      );
    }

    // Check if invoice exists
    const invoiceExists = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoiceExists) {
      return NextResponse.json(
        { error: 'Not Found', details: 'Invoice with the specified ID not found.' },
        { status: 404 }
      );
    }

    // Delete related payments first if necessary (adjust based on your schema relations/cascade rules)
    await prisma.payment.deleteMany({ where: { invoiceId: id } });
    // Delete related invoice items if necessary (adjust based on your schema relations/cascade rules)
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } }); 

    // Delete the invoice
    await prisma.invoice.delete({
      where: { id },
    });

    console.log('Deleted invoice:', id);
    return NextResponse.json({ message: 'Invoice deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting invoice:', error);
    // Handle potential Prisma errors (e.g., foreign key constraints if cascade delete isn't set up)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
       return NextResponse.json(
          { error: 'Database Error', details: 'Failed to delete invoice due to database issue.' },
          { status: 400 }
        );
    }
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Placeholder for PATCH handler
export async function PATCH(request: NextRequest, context: any) {
    return NextResponse.json({ error: 'Not Implemented' }, { status: 501 });
} 