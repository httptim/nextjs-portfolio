// app/api/projects/[id]/route.ts
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
    
    const projectId = params.id;
    
    // Fetch project details
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        tasks: {
          select: {
            id: true,
            status: true,
            dueDate: true,
          }
        },
      }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to view this project
    if (
      session.user.role !== 'ADMIN' && 
      project.clientId !== session.user.id
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to view this project' },
        { status: 403 }
      );
    }
    
    // Calculate project progress
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calculate overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = project.tasks.filter(task => 
      task.status !== 'COMPLETED' && task.dueDate < today
    ).length;
    
    // Find next deadline
    const upcomingTasks = project.tasks
      .filter(task => task.status !== 'COMPLETED' && task.dueDate >= today)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    
    const nextDeadline = upcomingTasks.length > 0 ? upcomingTasks[0].dueDate : null;
    
    // Fetch project team members
    const team = await prisma.user.findMany({
      where: {
        OR: [
          { id: project.clientId },
          { role: 'ADMIN' }
        ]
      },
      select: {
        id: true,
        name: true,
        role: true,
      }
    });
    
    // Format team data
    const formattedTeam = team.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role === 'ADMIN' ? 'Project Manager' : 'Client',
    }));
    
    // Fetch project documents
    const documents = await prisma.file.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        createdAt: true,
      }
    });
    
    // Format document data
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      url: doc.url,
      type: doc.type,
      createdAt: doc.createdAt.toISOString(),
    }));
    
    // Fetch recent tasks
    const recentTasks = await prisma.task.findMany({
      where: {
        projectId,
      },
      take: 5,
      orderBy: {
        dueDate: 'asc',
      },
      include: {
        assignedTo: {
          select: {
            name: true,
          }
        }
      }
    });
    
    // Format task data
    const formattedTasks = recentTasks.map(task => ({
      id: task.id,
      title: task.title,
      status: task.status.toLowerCase(),
      priority: task.priority.toLowerCase(),
      dueDate: task.dueDate.toISOString(),
      assignedTo: task.assignedTo?.name || 'Unassigned',
    }));
    
    // Fetch recent messages from the project's conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        projectId,
      },
      include: {
        messages: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                role: true,
              }
            }
          }
        }
      }
    });
    
    // Format message data
    const formattedMessages = conversation?.messages.map(message => ({
      id: message.id,
      content: message.content,
      sender: message.sender.role === 'ADMIN' ? 'admin' : 'customer',
      timestamp: message.createdAt.toISOString(),
    })) || [];
    
    // Format the response
    const formattedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status.toLowerCase(),
      progress,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate ? project.endDate.toISOString() : null,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        overdue: overdueTasks,
      },
      team: formattedTeam,
      nextDeadline: nextDeadline ? nextDeadline.toISOString() : null,
      documents: formattedDocuments,
    };
    
    return NextResponse.json({
      project: formattedProject,
      recentTasks: formattedTasks,
      recentMessages: formattedMessages,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}