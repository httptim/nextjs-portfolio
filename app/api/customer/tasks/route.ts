// app/api/customer/tasks/route.ts
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Parse query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');
    const priorityFilter = searchParams.get('priority');
    const projectFilter = searchParams.get('project');
    const search = searchParams.get('search') || '';
    
    // Build filter conditions
    const where: any = {
      project: {
        clientId: userId,
      },
    };
    
    // Add status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter.toUpperCase();
    }
    
    // Add priority filter if provided
    if (priorityFilter && priorityFilter !== 'all') {
      where.priority = priorityFilter.toUpperCase();
    }
    
    // Add project filter if provided
    if (projectFilter && projectFilter !== 'all') {
      where.projectId = projectFilter;
    }
    
    // Add search filter if provided
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Fetch tasks based on filters
    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            name: true,
          },
        },
        assignedTo: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    
    // Fetch projects for the filter dropdown
    const projects = await prisma.project.findMany({
      where: {
        clientId: userId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    // Format response
    const formattedTasks = tasks.map(task => ({
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
    }));
    
    return NextResponse.json({
      tasks: formattedTasks,
      projects,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}