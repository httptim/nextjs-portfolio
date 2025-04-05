import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    console.log('Portfolio Projects API called');
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found in portfolio-projects API');
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No session found' },
        { status: 401 }
      );
    }
    
    if (!session.user || !session.user.id) {
      console.log('User information missing in portfolio-projects API');
      return NextResponse.json(
        { error: 'User information missing', details: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Only admin users should access this API
    if (session.user.role !== 'ADMIN') {
      console.log('Non-admin user attempting to access portfolio-projects API');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Only admins can access this endpoint' },
        { status: 403 }
      );
    }
    
    // Fetch all projects with client information
    const projects = await prisma.project.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tasks: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format dates and calculate task stats
    const formattedProjects = projects.map(project => {
      // Calculate task statistics
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter(task => task.status === 'COMPLETED').length;
      
      // Calculate progress based on completed tasks or default to 0
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        progress: progress,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate ? project.endDate.toISOString() : null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        client: project.client,
        tasks: {
          total: totalTasks,
          completed: completedTasks
        }
      };
    });
    
    console.log(`Found ${formattedProjects.length} projects for admin dashboard`);
    return NextResponse.json({ projects: formattedProjects });
    
  } catch (error) {
    console.error('Error in portfolio-projects API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 