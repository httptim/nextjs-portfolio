// lib/services/contact-service.ts
import { prisma } from '../prisma';

export interface ContactSubmissionSummary {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  read: boolean;
  userId: string | null;
  userName: string | null;
}

export class ContactService {
  /**
   * Create a new contact form submission
   */
  static async createContactSubmission(data: {
    name: string;
    email: string;
    message: string;
    userId?: string;
  }) {
    const { name, email, message, userId } = data;
    
    const submission = await prisma.contactMessage.create({
      data: {
        name,
        email,
        message,
        userId: userId || null,
        read: false,
      },
    });
    
    return submission;
  }
  
  /**
   * Get all contact form submissions with pagination and filtering
   */
  static async getContactSubmissions(options: {
    page?: number;
    limit?: number;
    search?: string;
    read?: boolean;
  }) {
    const { page = 1, limit = 20, search, read } = options;
    
    // Create filter
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (read !== undefined) {
      where.read = read;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get submissions
    const submissions = await prisma.contactMessage.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    
    // Get total count for pagination
    const totalCount = await prisma.contactMessage.count({ where });
    
    // Format the response
    const formattedSubmissions: ContactSubmissionSummary[] = submissions.map(submission => ({
      id: submission.id,
      name: submission.name,
      email: submission.email,
      message: submission.message,
      createdAt: submission.createdAt,
      read: submission.read,
      userId: submission.userId,
      userName: submission.user?.name || null,
    }));
    
    return {
      submissions: formattedSubmissions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    };
  }
  
  /**
   * Get a single contact form submission by ID
   */
  static async getContactSubmissionById(id: string) {
    const submission = await prisma.contactMessage.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    if (!submission) {
      return null;
    }
    
    return {
      id: submission.id,
      name: submission.name,
      email: submission.email,
      message: submission.message,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      read: submission.read,
      user: submission.user,
    };
  }
  
  /**
   * Mark a contact form submission as read or unread
   */
  static async updateReadStatus(id: string, read: boolean) {
    const submission = await prisma.contactMessage.update({
      where: { id },
      data: { read },
    });
    
    return submission;
  }
  
  /**
   * Delete a contact form submission
   */
  static async deleteContactSubmission(id: string) {
    await prisma.contactMessage.delete({
      where: { id },
    });
    
    return true;
  }
  
  /**
   * Create a user reply to a contact form submission
   * This would typically trigger an email notification in a real application
   */
  static async createContactReply(data: {
    contactId: string;
    adminId: string;
    message: string;
  }) {
    const { contactId, adminId, message } = data;
    
    // First, get the contact submission to get the email address
    const contact = await prisma.contactMessage.findUnique({
      where: { id: contactId },
      select: {
        email: true,
        name: true,
      },
    });
    
    if (!contact) {
      throw new Error('Contact submission not found');
    }
    
    // For now, we just mark the message as read since we don't actually send emails in this demo
    await prisma.contactMessage.update({
      where: { id: contactId },
      data: { read: true },
    });
    
    // In a real application, you would send an email to the contact's email address
    // For this demo, we'll just log the information
    console.log(`Reply to ${contact.name} (${contact.email}): ${message}`);
    
    return { success: true };
  }
}