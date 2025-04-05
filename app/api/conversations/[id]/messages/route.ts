import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// POST handler to add a message to a specific conversation
export async function POST(request: NextRequest, context: any) { // Use context: any workaround
  try {
    const conversationId = context.params.id; // Get conversation ID from dynamic route
    console.log(`Messages API POST called for Conversation ID: ${conversationId}`);
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User must be logged in to send messages' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const content = body.content;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
       return NextResponse.json(
        { error: 'Bad Request', details: 'Message content cannot be empty.' },
        { status: 400 }
      );
    }

    // Verify the user is part of this conversation (either admin or the customer associated with the project)
    // This check might need refinement based on your exact authorization rules
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { project: { select: { clientId: true } } },
    });

    if (!conversation) {
       return NextResponse.json({ error: 'Not Found', details: 'Conversation not found.' }, { status: 404 });
    }

    const isUserAdmin = session.user.role === 'ADMIN';
    const isUserConversationCustomer = conversation.project?.clientId === session.user.id;

    if (!isUserAdmin && !isUserConversationCustomer) {
       return NextResponse.json({ error: 'Forbidden', details: 'User is not authorized to post in this conversation.' }, { status: 403 });
    }

    // Create the new message
    const newMessage = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        conversationId: conversationId,
      },
      include: { // Include sender details in the response
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Format the response to match the client's Message interface
    const formattedMessage = {
        id: newMessage.id,
        content: newMessage.content,
        sender: {
          id: newMessage.sender.id,
          name: newMessage.sender.name,
          role: newMessage.sender.role
        },
        timestamp: newMessage.createdAt.toISOString(), // Align with client interface
        read: false // New messages start as unread for the recipient
      };

    // TODO: Implement logic to notify the other user (e.g., using WebSockets/Pusher)

    console.log('Created new message:', newMessage.id);
    return NextResponse.json({ message: formattedMessage }, { status: 201 }); 

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle potential errors, e.g., foreign key constraint if conversationId is invalid
       console.error('Prisma Error creating message:', error);
       return NextResponse.json(
          { error: 'Database Error', details: 'Failed to create message due to database constraint.' },
          { status: 400 }
        );
    }
    console.error('Error creating message:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 