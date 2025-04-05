// app/api/tasks/[id]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Add a comment to a task
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const userId = session.user.id;
    
    // Check if task exists and user has permission
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: {
            clientId: true,
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
    
    // Check if user has permission (is admin or the client of the project)
    if (session.user.role !== 'ADMIN' && task.project.clientId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to comment on this task' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    // Create the comment
    const comment = await prisma.taskComment.create({
      data: {
        content,
        taskId,
        userId,
      },
      include: {
        user: {
          select: {
            name: true,
          }
        }
      }
    });
    
    // Format response
    const formattedComment = {
      id: comment.id,
      content: comment.content,
      author: comment.user.name,
      createdAt: comment.createdAt.toISOString(),
    };
    
    return NextResponse.json(
      { message: 'Comment added successfully', comment: formattedComment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}