import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    console.log('Content API called');
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found in content API');
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No session found' },
        { status: 401 }
      );
    }
    
    if (!session.user || !session.user.id) {
      console.log('User information missing in content API');
      return NextResponse.json(
        { error: 'User information missing', details: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // For now, we'll return an empty array since we don't have a content model yet
    // This is just a placeholder for future implementation
    console.log('Returning empty content array for user', session.user.id);
    return NextResponse.json({ content: [] });
    
    /* Sample implementation for when content model is added:
    if (session.user.role === 'ADMIN') {
      // Admins can see all content
      const content = await prisma.content.findMany({
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json({ content });
    } else {
      // Customers can only see their own content
      const content = await prisma.content.findMany({
        where: {
          project: {
            clientId: session.user.id
          }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      return NextResponse.json({ content });
    }
    */
  } catch (error) {
    console.error('Error in content API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 