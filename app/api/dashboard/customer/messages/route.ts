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
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get conversations and messages for the customer's projects
    const conversations = await prisma.conversation.findMany({
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
        messages: {
          include: {
            sender: {
              select: {
                name: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Format dates to ISO strings for JSON response
    const formattedConversations = conversations.map(conversation => ({
      ...conversation,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      messages: conversation.messages.map(message => ({
        ...message,
        createdAt: message.createdAt.toISOString()
      }))
    }));
    
    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error in customer dashboard messages API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 