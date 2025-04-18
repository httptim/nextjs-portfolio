import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    console.log('Conversations API called');
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found in conversations API');
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No session found' },
        { status: 401 }
      );
    }
    
    if (!session.user || !session.user.id) {
      console.log('User information missing in conversations API');
      return NextResponse.json(
        { error: 'User information missing', details: 'User ID is required' },
        { status: 401 }
      );
    }
    
    let conversations = [];
    
    // For admin users, fetch all conversations
    if (session.user.role === 'ADMIN') {
      console.log('Admin user accessing conversations API');
      conversations = await prisma.conversation.findMany({
        include: {
          project: {
            select: {
              id: true,
              name: true,
              client: {
                select: {
                  id: true,
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
    } else {
      // For customers, fetch only their conversations
      console.log('Customer user accessing conversations API');
      conversations = await prisma.conversation.findMany({
        where: {
          project: {
            clientId: session.user.id
          }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              client: {
                select: {
                  id: true,
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
    }
    
    // Format the dates for JSON
    const formattedConversations = conversations.map(conversation => {
      const customer = conversation.project?.client;
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      
      return {
        id: conversation.id,
        project: conversation.project ? {
          id: conversation.project.id,
          name: conversation.project.name || 'N/A'
        } : null,
        customer: customer ? {
          id: customer.id,
          name: customer.name || 'N/A',
          email: customer.email || 'N/A'
        } : { id: 'unknown', name: 'Unknown Customer', email: ''},
        messages: conversation.messages.map(message => ({
          id: message.id,
          content: message.content,
          sender: {
            id: message.sender.id,
            name: message.sender.name,
            role: message.sender.role
          },
          timestamp: message.createdAt.toISOString(),
          read: true
        })),
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          timestamp: lastMessage.createdAt.toISOString(),
          sender: lastMessage.sender.role
        } : { content: '', timestamp: conversation.updatedAt.toISOString(), sender: 'ADMIN' },
        unreadCount: 0,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString()
      };
    });
    
    console.log(`Found ${formattedConversations.length} conversations`);
    return NextResponse.json({ conversations: formattedConversations });
    
  } catch (error) {
    console.error('Error in conversations API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 