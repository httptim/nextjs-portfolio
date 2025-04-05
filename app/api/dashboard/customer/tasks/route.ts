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
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 