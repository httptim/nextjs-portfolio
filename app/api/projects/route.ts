import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    console.log('Projects API called');
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found in projects API');
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No session found' },
        { status: 401 }
      );
    }
    
    if (!session.user || !session.user.id) {
      console.log('User information missing in projects API');
      return NextResponse.json(
        { error: 'User information missing', details: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Filter projects based on user role
    if (session.user.role === 'ADMIN') {
      // Admins can see all projects
      const projects = await prisma.project.findMany({
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
      
      console.log(`Found ${projects.length} projects total`);
      
      // Format dates for JSON
      const formattedProjects = projects.map(project => ({
        ...project,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate?.toISOString() || null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }));
      
      return NextResponse.json({ projects: formattedProjects });
    } else {
      // Customers can only see their own projects
      const projects = await prisma.project.findMany({
        where: {
          clientId: session.user.id
        },
        orderBy: {
          name: 'asc'
        }
      });
      
      console.log(`Found ${projects.length} projects for customer ${session.user.id}`);
      
      // Format dates for JSON
      const formattedProjects = projects.map(project => ({
        ...project,
        startDate: project.startDate.toISOString(),
        endDate: project.endDate?.toISOString() || null,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }));
      
      return NextResponse.json({ projects: formattedProjects });
    }
  } catch (error) {
    console.error('Error in projects API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 