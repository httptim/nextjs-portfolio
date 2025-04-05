import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

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
              id: true,
              name: true,
              clientId: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          assignedTo: {
            select: {
              id: true,
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
      const formattedTasks = tasks.map(task => {
        // Make sure each task has a customer property based on the project.client
        return {
          ...task,
          // Add customer property explicitly
          customer: task.project.client || { 
            id: task.project.clientId, 
            name: 'Unknown Customer',
            email: 'unknown@example.com'
          },
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
          dueDate: task.dueDate.toISOString()
        };
      });
      
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
              id: true,
              name: true,
              clientId: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          assignedTo: {
            select: {
              id: true,
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
      const formattedTasks = tasks.map(task => {
        // Make sure each task has a customer property based on the project.client
        return {
          ...task,
          // Add customer property explicitly
          customer: task.project.client || { 
            id: task.project.clientId, 
            name: 'Unknown Customer',
            email: 'unknown@example.com'
          },
          createdAt: task.createdAt.toISOString(),
          updatedAt: task.updatedAt.toISOString(),
          dueDate: task.dueDate.toISOString()
        };
      });
      
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

// POST handler to create a new task
export async function POST(request: NextRequest) {
  try {
    console.log('Tasks API POST called');
    const session = await getServerSession(authOptions);

    // Only admins can create tasks via this endpoint
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to create tasks' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields (adjust based on client form data)
    if (!body.title || !body.projectId || !body.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Title, Project ID, and Due Date are required.' },
        { status: 400 }
      );
    }
    
    // Find the associated project to get the clientId
    const project = await prisma.project.findUnique({
        where: { id: body.projectId },
        select: { clientId: true }
    });

    if (!project) {
        return NextResponse.json({ error: 'Not Found', details: 'Project not found.' }, { status: 404 });
    }

    const newTaskData: Prisma.TaskCreateInput = {
      title: body.title,
      description: body.description || '',
      priority: body.priority || 'MEDIUM',
      status: body.status || 'TODO',
      dueDate: new Date(body.dueDate),
      project: { connect: { id: body.projectId } }, // Link to project
      createdBy: { connect: { id: session.user.id } }, // Link to creator (admin)
      // Optional: Link assignedTo user if provided
      ...(body.assignedToId && { assignedTo: { connect: { id: body.assignedToId } } }),
    };

    const newTask = await prisma.task.create({
      data: newTaskData,
      // Include necessary relations in the response to match client expectations
      include: {
          project: {
            select: {
              id: true,
              name: true,
              clientId: true,
              client: { // Include client (customer) via project
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          assignedTo: {
            select: {
              id: true,
              name: true
            }
          }
        }
    });

    // Format response
    const formattedTask = {
      ...newTask,
      customer: newTask.project.client || {
          id: newTask.project.clientId, 
          name: 'Unknown Customer', 
          email: ''
      },
      createdAt: newTask.createdAt.toISOString(),
      updatedAt: newTask.updatedAt.toISOString(),
      dueDate: newTask.dueDate.toISOString()
    };

    console.log('Created new task:', newTask.id);
    // Client expects { task: ... }
    return NextResponse.json({ task: formattedTask }, { status: 201 }); 

  } catch (error) {
    console.error('Error creating task:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
       return NextResponse.json(
          { error: 'Database Error', details: 'Failed to create task due to database issue.' },
          { status: 400 }
        );
    }
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 