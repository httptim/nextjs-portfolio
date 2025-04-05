import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// This is a compatibility endpoint that calls the actual customer tasks endpoint
export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    const session = await getServerSession(authOptions);
    
    console.log('Session in /api/tasks bridge API:', session?.user?.id, session?.user?.role);
    
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
    
    // For admin users, get all tasks
    if (session.user.role === 'ADMIN') {
      const tasks = await prisma.task.findMany({
        include: {
          project: {
            select: {
              name: true,
              client: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          assignedTo: {
            select: {
              name: true,
              email: true
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
    } 
    // For customer users, get only their tasks
    else {
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
    }
  } catch (error) {
    console.error('Error in tasks API bridge route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 