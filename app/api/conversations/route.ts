// app/api/conversations/route.ts
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
    
    const userId = session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    
    // Get query parameters
    const projectId = request.nextUrl.searchParams.get('project');
    
    // Build where clause based on user role and filters
    let whereClause: any = {};
    
    if (isAdmin) {
      // Admin can see all conversations
      if (projectId) {
        // Filter by project if provided
        whereClause.projectId = projectId;
      }
    } else {
      // Customers can only see conversations for their projects
      whereClause.project = {
        clientId: userId
      };
      
      if (projectId) {
        whereClause.projectId = projectId;
      }
    }
    
    // Fetch conversations
    const conversations = await prisma.conversation.findMany({
      where: whereClause,
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
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // Format response
    const formattedConversations = await Promise.all(conversations.map(async (conversation) => {
      // Get last message
      const lastMessage = conversation.messages[0];
      
      // Count unread messages
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          read: false,
          senderId: {
            not: userId
          }
        }
      });
      
      return {
        id: conversation.id,
        name: conversation.name || conversation.project.name,
        project: conversation.project.name,
        projectId: conversation.project.id,
        unreadCount,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          timestamp: lastMessage.createdAt.toISOString(),
          sender: lastMessage.senderId === userId ? 'self' : 'other'
        } : null,
        customer: {
          id: conversation.project.client.id,
          name: conversation.project.client.name,
          email: conversation.project.client.email
        }
      };
    }));
    
    return NextResponse.json({ conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  // Add this POST method to app/api/conversations/route.ts

export async function POST(request: NextRequest) {
    try {
      // Verify that the user is authenticated
      const session = await getServerSession(authOptions);
      
      if (!session) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }
      
      // Parse the request body
      const body = await request.json();
      const { projectId, name, initialMessage } = body;
      
      if (!projectId) {
        return NextResponse.json(
          { error: 'Project ID is required' },
          { status: 400 }
        );
      }
      
      // Check if the project exists
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          client: {
            select: {
              id: true
            }
          }
        }
      });
      
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      // Check if user has access to this project
      const isAdmin = session.user.role === 'ADMIN';
      if (!isAdmin && project.client.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Not authorized to create a conversation for this project' },
          { status: 403 }
        );
      }
      
      // Check if a conversation for this project already exists
      const existingConversation = await prisma.conversation.findFirst({
        where: { projectId }
      });
      
      if (existingConversation) {
        return NextResponse.json(
          {
            message: 'Conversation already exists',
            conversationId: existingConversation.id
          },
          { status: 200 }
        );
      }
      
      // Create a new conversation
      const conversation = await prisma.conversation.create({
        data: {
          name: name || project.name,
          projectId
        }
      });
      
      // If an initial message is provided, create it
      if (initialMessage) {
        await prisma.message.create({
          data: {
            content: initialMessage,
            read: false,
            conversationId: conversation.id,
            senderId: session.user.id
          }
        });
      }
      
      return NextResponse.json(
        {
          message: 'Conversation created successfully',
          conversationId: conversation.id
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}