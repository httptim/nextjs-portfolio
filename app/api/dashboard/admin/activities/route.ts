// app/api/dashboard/admin/activities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { DashboardService } from '@/lib/services/dashboard-service';

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    // Get limit from query params
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');
    
    // Get recent activities
    const activities = await DashboardService.getAdminRecentActivities(limit);
    
    // Format dates to ISO strings for JSON response
    const formattedActivities = activities.map(activity => ({
      ...activity,
      timestamp: activity.timestamp.toISOString(),
    }));
    
    return NextResponse.json({ activities: formattedActivities });
  } catch (error) {
    console.error('Error in dashboard activities API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}