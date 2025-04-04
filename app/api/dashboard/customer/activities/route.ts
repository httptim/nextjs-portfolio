// app/api/dashboard/customer/activities/route.ts
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
    
    // Get limit from query params
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    
    // Get recent activities for the customer
    const activities = await DashboardService.getCustomerRecentActivities(session.user.id, limit);
    
    // Format dates to ISO strings for JSON response
    const formattedActivities = activities.map(activity => ({
      ...activity,
      timestamp: activity.timestamp.toISOString(),
    }));
    
    return NextResponse.json({ activities: formattedActivities });
  } catch (error) {
    console.error('Error in customer dashboard activities API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}