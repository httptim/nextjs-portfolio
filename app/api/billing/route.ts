import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// This is a compatibility endpoint that calls the actual customer billing endpoint
export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    console.log('Billing API bridge called');
    const session = await getServerSession(authOptions);
    
    console.log('Session in billing API bridge:', session?.user?.id, session?.user?.role);
    
    if (!session) {
      console.log('No session found in billing API bridge');
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No session found' },
        { status: 401 }
      );
    }
    
    if (!session.user || !session.user.id) {
      console.log('User information missing in billing API bridge');
      return NextResponse.json(
        { error: 'User information missing', details: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Get invoices for the user
    if (session.user.role === 'ADMIN') {
      // For admin users, get all invoices
      console.log('Admin user - fetching all invoices');
      const invoices = await prisma.invoice.findMany({
        include: {
          project: {
            select: {
              name: true
            }
          },
          client: {
            select: {
              name: true,
              email: true
            }
          },
          items: true,
          payments: true
        },
        orderBy: {
          date: 'desc'
        }
      });
      
      console.log(`Found ${invoices.length} invoices total`);
      
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
    } else {
      // For customer users, get only their invoices
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
    }
  } catch (error) {
    console.error('Error in billing API bridge route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 