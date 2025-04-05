import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get invoices for the customer
    const invoices = await prisma.invoice.findMany({
      where: {
        clientId: session.user.id
      },
      include: {
        project: {
          select: {
            name: true
          }
        },
        items: true,
        payments: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Format dates to ISO strings for JSON response
    const formattedInvoices = invoices.map(invoice => ({
      ...invoice,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      payments: invoice.payments.map(payment => ({
        ...payment,
        date: payment.date.toISOString(),
        createdAt: payment.createdAt.toISOString()
      }))
    }));
    
    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Error in customer dashboard billing API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 