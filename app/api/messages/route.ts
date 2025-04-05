import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// This is a compatibility endpoint that calls the actual customer messages endpoint
export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    console.log('Messages API bridge called');
    const session = await getServerSession(authOptions);
    
    console.log('Session in messages API bridge:', session?.user?.id, session?.user?.role);
    
    if (!session) {
      console.log('No session found in messages API bridge');
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No session found' },
        { status: 401 }
      );
    }
    
    if (!session.user || !session.user.id) {
      console.log('User information missing in messages API bridge');
      return NextResponse.json(
        { error: 'User information missing', details: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // Fetch conversations with messages based on user role
    if (session.user.role === 'ADMIN') {
      // For admin, get all conversations
      const conversations = await prisma.conversation.findMany({
        include: {
          project: {
            select: {
              name: true,
              client: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      // Format dates for JSON
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
    } else {
      // For customer, get only their conversations
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
                  id: true,
                  name: true,
                  role: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      
      // Format dates for JSON
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
    }
  } catch (error) {
    console.error('Error in messages API bridge route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 