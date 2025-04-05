import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// PUT handler to update a specific task by ID
export async function PUT(request: NextRequest, context: any) { // Use context: any workaround
  try {
    const id = context.params.id;
    console.log(`Tasks API PUT called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    // Only admins can update tasks
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to update tasks' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Prepare data for update, only include fields present in the body
    const dataToUpdate: Prisma.TaskUpdateInput = {};
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (body.priority !== undefined) dataToUpdate.priority = body.priority;
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.dueDate !== undefined) dataToUpdate.dueDate = new Date(body.dueDate);
    // Handle project change if projectId is provided
    if (body.projectId !== undefined) {
        dataToUpdate.project = { connect: { id: body.projectId } };
    }
    // Handle assignedTo change
    if (body.assignedToId !== undefined) {
      if (body.assignedToId === null || body.assignedToId === '') {
        // Disconnect if assignedToId is null or empty
        dataToUpdate.assignedTo = { disconnect: true };
      } else {
        // Connect if assignedToId is provided
        dataToUpdate.assignedTo = { connect: { id: body.assignedToId } };
      }
    }
    
    if (Object.keys(dataToUpdate).length === 0) {
       return NextResponse.json(
        { error: 'Bad Request', details: 'No valid fields provided for update.' },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: dataToUpdate,
      // Include relations needed by the client response
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
      ...updatedTask,
      customer: updatedTask.project.client || {
          id: updatedTask.project.clientId, 
          name: 'Unknown Customer', 
          email: ''
      },
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
      dueDate: updatedTask.dueDate.toISOString()
    };


    console.log('Updated task:', updatedTask.id);
    // Client expects { task: ... } in response
    return NextResponse.json({ task: formattedTask }); 

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
    }
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE handler for a specific task by ID
export async function DELETE(request: NextRequest, context: any) { // Use context: any workaround
   try {
    const id = context.params.id;
    console.log(`Tasks API DELETE called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    // Only admins can delete tasks
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to delete tasks' },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id },
    });

    console.log('Deleted task:', id);
    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });

  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
    }
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 