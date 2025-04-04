// app/api/dashboard/customer/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { DashboardService } from '@/lib/services/dashboard-service';

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
    
    // Get dashboard stats for the customer
    const stats = await DashboardService.getCustomerStats(session.user.id);
    
    // Format dates to ISO strings for JSON response
    const formattedStats = {
      ...stats,
      nextDeadline: stats.nextDeadline ? stats.nextDeadline.toISOString() : null,
    };
    
    return NextResponse.json({ stats: formattedStats });
  } catch (error) {
    console.error('Error in customer dashboard stats API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}