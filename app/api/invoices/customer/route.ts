// app/api/invoices/customer/route.ts
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
    
    const userId = session.user.id;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    // Build the where clause
    let whereClause: any = { clientId: userId };
    
    // Add status filter if provided
    if (status) {
      whereClause.status = status.toUpperCase();
    }
    
    // Fetch the invoices
    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            name: true,
          }
        },
        items: true,
      },
      orderBy: {
        date: 'desc',
      }
    });
    
    // Format the data for the client
    const formattedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      amount: invoice.amount,
      status: invoice.status,
      project: invoice.project.name,
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.rate * item.quantity,
      })),
      paypalOrderId: invoice.paypalOrderId,
    }));
    
    return NextResponse.json({ invoices: formattedInvoices });
  } catch (error) {
    console.error('Error fetching customer invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}