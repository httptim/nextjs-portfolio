import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    const session = await getServerSession(authOptions);
    
    console.log('Session in tasks API:', session?.user?.id, session?.user?.role);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No session found' },
        { status: 401 }
      );
    }
    
    if (!session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'User information missing', details: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Get tasks for the customer's projects
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          clientId: session.user.id
        }
      },
      include: {
        project: {
          select: {
            name: true
          }
        },
        assignedTo: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
    
    console.log(`Found ${tasks.length} tasks for user ${session.user.id}`);
    
    // Format dates to ISO strings for JSON response
    const formattedTasks = tasks.map(task => ({
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      dueDate: task.dueDate.toISOString()
    }));
    
    return NextResponse.json({ tasks: formattedTasks });
  } catch (error) {
    console.error('Error in customer dashboard tasks API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 