// lib/services/message-service.ts
import { prisma } from '../prisma';
import { Role } from '@prisma/client';

export interface ConversationSummary {
  id: string;
  projectId: string | null;
  projectName: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: {
    content: string;
    timestamp: Date;
    senderId: string;
  } | null;
  unreadCount: number;
}

export interface MessageSummary {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  timestamp: Date;
  read: boolean;
}

export class MessageService {
  /**
   * Get conversations for a customer
   */
  static async getCustomerConversations(customerId: string): Promise<ConversationSummary[]> {
    const conversations = await prisma.conversation.findMany({
      where: {
        project: {
          clientId: customerId,
        },
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
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // Format conversations with unread counts
    const formattedConversations = [];
    
    for (const conversation of conversations) {
      // Count unread messages (only those not sent by the customer)
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          senderId: {
            not: customerId,
          },
          read: false,
        },
      });

      const lastMessage = conversation.messages[0];

      formattedConversations.push({
        id: conversation.id,
        projectId: conversation.projectId,
        projectName: conversation.project?.name || null,
        customer: {
          id: conversation.project?.client.id || '',
          name: conversation.project?.client.name || '',
          email: conversation.project?.client.email || '',
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              timestamp: lastMessage.createdAt,
              senderId: lastMessage.senderId,
            }
          : null,
        unreadCount,
      });
    }

    return formattedConversations;
  }

  /**
   * Get conversations for an admin
   */
  static async getAdminConversations(): Promise<ConversationSummary[]> {
    const conversations = await prisma.conversation.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format conversations with unread counts
    const formattedConversations = [];
    
    for (const conversation of conversations) {
      // Count unread messages (only those sent by the customer)
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conversation.id,
          sender: {
            role: 'CUSTOMER',
          },
          read: false,
        },
      });

      const lastMessage = conversation.messages[0];

      formattedConversations.push({
        id: conversation.id,
        projectId: conversation.projectId,
        projectName: conversation.project?.name || null,
        customer: {
          id: conversation.project?.client.id || '',
          name: conversation.project?.client.name || '',
          email: conversation.project?.client.email || '',
        },
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              timestamp: lastMessage.createdAt,
              senderId: lastMessage.senderId,
            }
          : null,
        unreadCount,
      });
    }

    return formattedConversations;
  }

  /**
   * Get messages in a conversation
   */
  static async getConversationMessages(
    conversationId: string,
    userId: string
  ): Promise<MessageSummary[]> {
    // Get the conversation messages
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Mark messages as read if they weren't sent by this user
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        read: false,
      },
      data: {
        read: true,
      },
    });

    // Format messages
    return messages.map(message => ({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderRole: message.sender.role,
      timestamp: message.createdAt,
      read: message.read,
    }));
  }

  /**
   * Send a message in a conversation
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<MessageSummary> {
    // Validate that the conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        project: {
          select: {
            clientId: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get sender details
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });

    if (!sender) {
      throw new Error('Sender not found');
    }

    // Validate that the sender has permission to send messages in this conversation
    const isAdmin = sender.role === 'ADMIN';
    const isClient = sender.id === conversation.project?.clientId;

    if (!isAdmin && !isClient) {
      throw new Error('Not authorized to send messages in this conversation');
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId,
        read: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName: message.sender.name,
      senderRole: message.sender.role,
      timestamp: message.createdAt,
      read: message.read,
    };
  }

  /**
   * Create a new conversation for a project
   */
  static async createConversation(projectId: string): Promise<string> {
    // Check if a conversation already exists for this project
    const existingConversation = await prisma.conversation.findFirst({
      where: { projectId },
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create a new conversation
    const conversation = await prisma.conversation.create({
      data: {
        projectId,
      },
    });

    return conversation.id;
  }

  /**
   * Create a general support conversation for a customer
   */
  static async createSupportConversation(customerId: string): Promise<string> {
    // Check if a support conversation already exists for this customer
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        projectId: null,
        messages: {
          some: {
            sender: {
              id: customerId,
            },
          },
        },
      },
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create a new conversation without a project
    const conversation = await prisma.conversation.create({
      data: {
        projectId: null,
      },
    });

    return conversation.id;
  }
}