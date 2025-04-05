import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Existing DELETE handler ...

// PATCH handler to update a conversation (e.g., mark messages as read)
export async function PATCH(request: NextRequest, context: any) { // Use context: any workaround
  try {
    const conversationId = context.params.id;
    console.log(`Conversations API PATCH called for ID: ${conversationId}`);
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User must be logged in' },
        { status: 401 }
      );
    }

    // Potential actions: mark as read. Expect body like { action: 'mark_read' }
    const body = await request.json();

    if (body.action === 'mark_read') {
      // Verify user is part of this conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { project: { select: { clientId: true } } },
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
      const isUserAdmin = session.user.role === 'ADMIN';
      const isUserConvCustomer = conversation.project?.clientId === session.user.id;
      if (!isUserAdmin && !isUserConvCustomer) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Update messages in the conversation that were *not* sent by the current user
      const updateResult = await prisma.message.updateMany({
        where: {
          conversationId: conversationId,
          senderId: { 
            not: session.user.id // Don't mark own messages
          },
          read: false // Only update unread messages
        },
        data: {
          read: true,
        },
      });

      console.log(`Marked ${updateResult.count} messages as read for user ${session.user.id} in conversation ${conversationId}`);
      return NextResponse.json({ message: `Marked ${updateResult.count} messages as read.` });

    } else {
      return NextResponse.json({ error: 'Bad Request', details: 'Invalid or missing action in request body.' }, { status: 400 });
    }

  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
       if (error.code === 'P2025') { // Should be caught by initial conversation check
         return NextResponse.json({ error: 'Not Found' }, { status: 404 });
       }
     }
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 