import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET handler for billing statistics (Admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('Invoice Stats API GET called');
    const session = await getServerSession(authOptions);

    // Ensure user is admin
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to access billing stats' },
        { status: 403 }
      );
    }

    // Fetch all invoices to calculate stats
    // Note: This could be inefficient for very large datasets. Consider pre-calculating or optimizing.
    const invoices = await prisma.invoice.findMany({
        select: { status: true, amount: true }
    });

    const paidInvoices = invoices.filter((inv) => inv.status === 'PAID').length;
    const unpaidInvoices = invoices.filter((inv) => inv.status === 'UNPAID').length;
    const overdueInvoices = invoices.filter((inv) => inv.status === 'OVERDUE').length;
    
    const totalRevenue = invoices
        .filter((inv) => inv.status === 'PAID')
        .reduce((sum, inv) => sum + inv.amount, 0);
        
    const outstandingAmount = invoices
        .filter((inv) => inv.status === 'UNPAID' || inv.status === 'OVERDUE')
        .reduce((sum, inv) => sum + inv.amount, 0);

    const stats = {
        totalRevenue,
        outstandingAmount,
        paidInvoices,
        unpaidInvoices,
        overdueInvoices,
    };

    console.log('Calculated invoice stats for admin', stats);
    return NextResponse.json(stats); // Return stats object directly

  } catch (error) {
    console.error('Error calculating invoice stats:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 