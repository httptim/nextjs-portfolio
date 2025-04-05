// app/api/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Get messages from a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const conversationId = params.id;
    
    // Check if the conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        project: {
          select: {
            clientId: true
          }
        }
      }
    });
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Check if the user has access to this conversation
    if (!isAdmin && conversation.project.clientId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to view this conversation' },
        { status: 403 }
      );
    }
    
    // Get messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId
      },
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
    });
    
    // Format the response
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      sender: message.sender.role === 'ADMIN' ? 'admin' : 'customer',
      timestamp: message.createdAt.toISOString(),
      read: message.read
    }));
    
    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId
        },
        read: false
      },
      data: {
        read: true
      }
    });
    
    return NextResponse.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Send a new message in a conversation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const conversationId = params.id;
    
    // Check if the conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        project: {
          select: {
            clientId: true
          }
        }
      }
    });
    
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Check if the user has access to this conversation
    if (!isAdmin && conversation.project.clientId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to send messages in this conversation' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { content } = body;
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }
    
    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        read: false,
        conversationId,
        senderId: userId
      }
    });
    
    // Update conversation's updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });
    
    // Format the response
    const formattedMessage = {
      id: message.id,
      content: message.content,
      sender: isAdmin ? 'admin' : 'customer',
      timestamp: message.createdAt.toISOString(),
      read: message.read
    };
    
    return NextResponse.json(
      { message: formattedMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}