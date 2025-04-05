// app/api/dashboard/customer/notifications/route.ts
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
    
    // Get notifications for the customer
    const notifications = await DashboardService.getCustomerNotifications(session.user.id);
    
    // Format dates to ISO strings for JSON response
    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      time: notification.time.toISOString(),
    }));
    
    return NextResponse.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('Error in customer notifications API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update notification read status
export async function PUT(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    if (!body.notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }
    
    // The notificationId format is used to determine the type of notification
    // e.g., "msg-{conversationId}", "task-{taskId}", "inv-{invoiceId}"
    const { notificationId } = body;
    
    if (notificationId.startsWith('msg-')) {
      // Mark messages in a conversation as read
      const conversationId = notificationId.substring(4);
      
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: {
            not: session.user.id,
          },
          read: false,
        },
        data: {
          read: true,
        },
      });
    }
    
    // Other notification types don't actually change the underlying data
    // They're just informational, like task deadlines and invoice reminders
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}