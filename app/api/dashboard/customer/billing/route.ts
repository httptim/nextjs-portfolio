import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    console.log('Billing API route called');
    const session = await getServerSession(authOptions);
    
    console.log('Session in billing API:', session?.user?.id, session?.user?.role);
    
    if (!session) {
      console.log('No session found in billing API');
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No session found' },
        { status: 401 }
      );
    }
    
    if (!session.user || !session.user.id) {
      console.log('User information missing in billing API');
      return NextResponse.json(
        { error: 'User information missing', details: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Get invoices for the customer
    console.log(`Finding invoices for customer ${session.user.id}`);
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
    
    console.log(`Found ${invoices.length} invoices for user ${session.user.id}`);
    
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
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 