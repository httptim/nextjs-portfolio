// app/api/tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify that the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const taskId = params.id;
    
    // Fetch task with project details
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            name: true,
            clientId: true,
          }
        },
        assignedTo: {
          select: {
            name: true,
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            url: true,
            createdAt: true,
          }
        }
      }
    });
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to view this task
    if (
      session.user.role !== 'ADMIN' && 
      task.project.clientId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to view this task' },
        { status: 403 }
      );
    }
    
    // Format the response
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      projectName: task.project.name,
      priority: task.priority.toLowerCase(),
      status: task.status.toLowerCase(),
      dueDate: task.dueDate.toISOString(),
      createdAt: task.createdAt.toISOString(),
      assignedTo: task.assignedTo?.name || 'Unassigned',
      comments: task.comments?.map(comment => ({
        id: comment.id,
        content: comment.content,
        author: comment.user.name,
        createdAt: comment.createdAt.toISOString(),
      })) || [],
      attachments: task.attachments?.map(attachment => ({
        id: attachment.id,
        filename: attachment.filename,
        url: attachment.url,
        createdAt: attachment.createdAt.toISOString(),
      })) || [],
    };
    
    return NextResponse.json({ task: formattedTask });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}