// lib/services/dashboard-service.ts
import { prisma } from '../prisma';
import { Role, TaskStatus, Status as ProjectStatus, InvoiceStatus } from '@prisma/client';

interface DashboardStatsAdmin {
  totalCustomers: number;
  activeProjects: number;
  completedProjects: number;
  tasksCompleted: number;
  pendingTasks: number;
  openInquiries: number;
  monthlyRevenue: number;
}

interface DashboardStatsCustomer {
  activeProjects: number;
  completedProjects: number;
  tasksCompleted: number;
  pendingTasks: number;
  nextDeadline: Date | null;
  totalInvoices: number;
  unpaidInvoices: number;
}

interface RecentActivity {
  id: string;
  type: 'task' | 'message' | 'payment' | 'project' | 'invoice' | 'contact';
  action: string;
  project: string | null;
  customer: string | null;
  timestamp: Date;
}

interface CustomerNotification {
  id: string;
  message: string;
  read: boolean;
  time: Date;
  link?: string;
}

export class DashboardService {
  /**
   * Get dashboard stats for admin users
   */
  static async getAdminStats(): Promise<DashboardStatsAdmin> {
    // Get total customers
    const totalCustomers = await prisma.user.count({
      where: { role: Role.CUSTOMER },
    });
    
    // Get project stats
    const activeProjects = await prisma.project.count({
      where: { status: ProjectStatus.ACTIVE },
    });
    
    const completedProjects = await prisma.project.count({
      where: { status: ProjectStatus.COMPLETED },
    });
    
    // Get task stats
    const tasksCompleted = await prisma.task.count({
      where: { status: TaskStatus.COMPLETED },
    });
    
    const pendingTasks = await prisma.task.count({
      where: {
        status: {
          in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW],
        },
      },
    });
    
    // Get open inquiries (unread contact messages)
    const openInquiries = await prisma.contactMessage.count({
      where: { read: false },
    });
    
    // Calculate monthly revenue (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthlyPayments = await prisma.payment.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        amount: true,
      },
    });
    
    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return {
      totalCustomers,
      activeProjects,
      completedProjects,
      tasksCompleted,
      pendingTasks,
      openInquiries,
      monthlyRevenue,
    };
  }
  
  /**
   * Get dashboard stats for a specific customer
   */
  static async getCustomerStats(customerId: string): Promise<DashboardStatsCustomer> {
    // Get project stats
    const activeProjects = await prisma.project.count({
      where: {
        clientId: customerId,
        status: ProjectStatus.ACTIVE,
      },
    });
    
    const completedProjects = await prisma.project.count({
      where: {
        clientId: customerId,
        status: ProjectStatus.COMPLETED,
      },
    });
    
    // Get task stats
    const tasksCompleted = await prisma.task.count({
      where: {
        project: {
          clientId: customerId,
        },
        status: TaskStatus.COMPLETED,
      },
    });
    
    const pendingTasks = await prisma.task.count({
      where: {
        project: {
          clientId: customerId,
        },
        status: {
          in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW],
        },
      },
    });
    
    // Get next deadline (earliest due task)
    const nextTask = await prisma.task.findFirst({
      where: {
        project: {
          clientId: customerId,
        },
        status: {
          in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW],
        },
        dueDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
    
    // Get invoice stats
    const totalInvoices = await prisma.invoice.count({
      where: {
        clientId: customerId,
      },
    });
    
    const unpaidInvoices = await prisma.invoice.count({
      where: {
        clientId: customerId,
        status: {
          in: [InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE],
        },
      },
    });
    
    return {
      activeProjects,
      completedProjects,
      tasksCompleted,
      pendingTasks,
      nextDeadline: nextTask?.dueDate || null,
      totalInvoices,
      unpaidInvoices,
    };
  }
  
  /**
   * Get recent activities for admin dashboard
   */
  static async getAdminRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    // Get recent completed tasks
    const recentTasks = await prisma.task.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      include: {
        project: {
          select: {
            name: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    const taskActivities: RecentActivity[] = recentTasks.map(task => {
      let action = `Task "${task.title}" was `;
      
      switch (task.status) {
        case TaskStatus.COMPLETED:
          action += 'completed';
          break;
        case TaskStatus.REVIEW:
          action += 'moved to review';
          break;
        case TaskStatus.IN_PROGRESS:
          action += 'started';
          break;
        default:
          action += 'updated';
      }
      
      return {
        id: `task-${task.id}`,
        type: 'task',
        action,
        project: task.project.name,
        customer: task.project.client.name,
        timestamp: task.updatedAt,
      };
    });
    
    // Get recent messages
    const recentMessages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        sender: {
          select: {
            name: true,
            role: true,
          },
        },
        conversation: {
          include: {
            project: {
              select: {
                name: true,
                client: {
                  select: {
                    name: true,
                  }
                }
              },
            },
          },
        },
      },
    });
    
    const messageActivities: RecentActivity[] = recentMessages.map(message => {
      const isCustomer = message.sender.role === Role.CUSTOMER;
      const action = isCustomer 
        ? `Message received from ${message.sender.name}` 
        : `Message sent to ${message.conversation.project?.client.name || 'client'}`;
        
      return {
        id: `message-${message.id}`,
        type: 'message',
        action,
        project: message.conversation.project?.name || null,
        customer: isCustomer ? message.sender.name : message.conversation.project?.client.name || null,
        timestamp: message.createdAt,
      };
    });
    
    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      orderBy: {
        date: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        invoice: {
          include: {
            project: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    const paymentActivities: RecentActivity[] = recentPayments.map(payment => ({
      id: `payment-${payment.id}`,
      type: 'payment',
      action: `Payment of $${payment.amount.toFixed(2)} received`,
      project: payment.invoice.project.name,
      customer: payment.user.name,
      timestamp: payment.date,
    }));
    
    // Get recent contact form submissions
    const recentContacts = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: Math.floor(limit / 2), // Limit the number of contact messages
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    
    const contactActivities: RecentActivity[] = recentContacts.map(contact => ({
      id: `contact-${contact.id}`,
      type: 'contact',
      action: `Contact form submission from ${contact.name}`,
      project: null,
      customer: contact.user?.name || contact.name,
      timestamp: contact.createdAt,
    }));
    
    // Get recent project status changes
    const recentProjects = await prisma.project.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: Math.floor(limit / 2),
      include: {
        client: {
          select: {
            name: true,
          },
        },
      },
    });
    
    const projectActivities: RecentActivity[] = recentProjects.map(project => {
      let action = `Project "${project.name}" `;
      
      switch (project.status) {
        case ProjectStatus.COMPLETED:
          action += 'was completed';
          break;
        case ProjectStatus.ACTIVE:
          action += 'is now active';
          break;
        case ProjectStatus.ON_HOLD:
          action += 'was put on hold';
          break;
        case ProjectStatus.CANCELLED:
          action += 'was cancelled';
          break;
        default:
          action += 'was updated';
      }
      
      return {
        id: `project-${project.id}`,
        type: 'project',
        action,
        project: project.name,
        customer: project.client.name,
        timestamp: project.updatedAt,
      };
    });
    
    // Combine all activities, sort by timestamp, and limit
    const allActivities = [
      ...taskActivities, 
      ...messageActivities, 
      ...paymentActivities, 
      ...contactActivities,
      ...projectActivities
    ];
    
    allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return allActivities.slice(0, limit);
  }
  
  /**
   * Get recent activities for a specific customer
   */
  static async getCustomerRecentActivities(customerId: string, limit: number = 10): Promise<RecentActivity[]> {
    // Get recent tasks updated for customer's projects
    const recentTasks = await prisma.task.findMany({
      where: {
        project: {
          clientId: customerId,
        },
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });
    
    const taskActivities: RecentActivity[] = recentTasks.map(task => {
      let statusText = '';
      
      switch (task.status) {
        case TaskStatus.COMPLETED:
          statusText = 'completed';
          break;
        case TaskStatus.REVIEW:
          statusText = 'in review';
          break;
        case TaskStatus.IN_PROGRESS:
          statusText = 'in progress';
          break;
        case TaskStatus.TODO:
          statusText = 'added to your tasks';
          break;
        default:
          statusText = 'updated';
      }
      
      return {
        id: `task-${task.id}`,
        type: 'task',
        action: `Task "${task.title}" was ${statusText}`,
        project: task.project.name,
        customer: null,
        timestamp: task.updatedAt,
      };
    });
    
    // Get project updates
    const projects = await prisma.project.findMany({
      where: {
        clientId: customerId,
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: Math.floor(limit / 2),
    });
    
    const projectActivities: RecentActivity[] = projects.map(project => {
      let action = `Project "${project.name}" `;
      
      switch (project.status) {
        case ProjectStatus.COMPLETED:
          action += 'was completed';
          break;
        case ProjectStatus.ACTIVE:
          action += 'is now active';
          break;
        case ProjectStatus.ON_HOLD:
          action += 'was put on hold';
          break;
        default:
          action += 'was updated';
      }
      
      return {
        id: `project-${project.id}`,
        type: 'project',
        action,
        project: project.name,
        customer: null,
        timestamp: project.updatedAt,
      };
    });
    
    // Get recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: {
        clientId: customerId,
      },
      orderBy: {
        date: 'desc',
      },
      take: Math.floor(limit / 2),
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });
    
    const invoiceActivities: RecentActivity[] = recentInvoices.map(invoice => {
      let action = `Invoice #${invoice.number} `;
      
      switch (invoice.status) {
        case InvoiceStatus.PAID:
          action += 'was paid';
          break;
        case InvoiceStatus.UNPAID:
          action += 'was created';
          break;
        case InvoiceStatus.OVERDUE:
          action += 'is now overdue';
          break;
        default:
          action += `(${invoice.status.toLowerCase()})`;
      }
      
      action += ` - $${invoice.amount.toFixed(2)}`;
      
      return {
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        action,
        project: invoice.project.name,
        customer: null,
        timestamp: invoice.date,
      };
    });
    
    // Get recent messages in conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        project: {
          clientId: customerId,
        },
      },
      select: {
        id: true,
        project: {
          select: {
            name: true,
          },
        },
      },
    });
    
    const conversationIds = conversations.map(c => c.id);
    
    const recentMessages = await prisma.message.findMany({
      where: {
        conversationId: {
          in: conversationIds,
        },
        senderId: {
          not: customerId, // Only admin messages
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Math.floor(limit / 3),
      include: {
        conversation: {
          select: {
            project: {
              select: {
                name: true,
              },
            },
          },
        },
        sender: {
          select: {
            name: true,
          },
        },
      },
    });
    
    const messageActivities: RecentActivity[] = recentMessages.map(message => ({
      id: `message-${message.id}`,
      type: 'message',
      action: `New message from ${message.sender.name}`,
      project: message.conversation.project?.name || null,
      customer: null,
      timestamp: message.createdAt,
    }));
    
    // Combine all activities, sort by timestamp, and limit
    const allActivities = [
      ...taskActivities, 
      ...projectActivities, 
      ...invoiceActivities,
      ...messageActivities
    ];
    
    allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return allActivities.slice(0, limit);
  }
  
  /**
   * Get notifications for a specific customer
   */
  static async getCustomerNotifications(customerId: string): Promise<CustomerNotification[]> {
    const notifications: CustomerNotification[] = [];
    
    // Check for unread messages
    const conversations = await prisma.conversation.findMany({
      where: {
        project: {
          clientId: customerId,
        },
      },
      select: {
        id: true,
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    const conversationIds = conversations.map(c => c.id);
    
    if (conversationIds.length > 0) {
      const unreadMessages = await prisma.message.findMany({
        where: {
          conversationId: {
            in: conversationIds,
          },
          senderId: {
            not: customerId, // Only admin messages
          },
          read: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          conversation: {
            select: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        take: 5, // Limit the number of message notifications
      });
      
      // Group unread messages by conversation
      const conversationMessageCounts = new Map<string, { count: number; projectId: string; projectName: string; latestTime: Date }>();
      
      unreadMessages.forEach(message => {
        const conversationId = message.conversationId;
        const projectId = message.conversation.project?.id || '';
        const projectName = message.conversation.project?.name || 'Unknown project';
        
        if (conversationMessageCounts.has(conversationId)) {
          const current = conversationMessageCounts.get(conversationId)!;
          current.count++;
          
          if (message.createdAt > current.latestTime) {
            current.latestTime = message.createdAt;
          }
        } else {
          conversationMessageCounts.set(conversationId, {
            count: 1,
            projectId,
            projectName,
            latestTime: message.createdAt,
          });
        }
      });
      
      // Create notifications for unread messages
      conversationMessageCounts.forEach((data, conversationId) => {
        notifications.push({
          id: `msg-${conversationId}`,
          message: `You have ${data.count} unread message${data.count > 1 ? 's' : ''} for project: ${data.projectName}`,
          read: false,
          time: data.latestTime,
          link: `/dashboard/customer/chat?project=${data.projectId}`,
        });
      });
    }
    
    // Check for upcoming task deadlines
    const upcomingTasks = await prisma.task.findMany({
      where: {
        project: {
          clientId: customerId,
        },
        status: {
          in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW],
        },
        dueDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      take: 5,
    });
    
    upcomingTasks.forEach(task => {
      const daysToDeadline = Math.ceil((task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      let deadlineText = '';
      
      if (daysToDeadline === 0) {
        deadlineText = 'today';
      } else if (daysToDeadline === 1) {
        deadlineText = 'tomorrow';
      } else {
        deadlineText = `in ${daysToDeadline} days`;
      }
      
      notifications.push({
        id: `task-${task.id}`,
        message: `Task "${task.title}" for project ${task.project.name} is due ${deadlineText}`,
        read: false,
        time: new Date(), // Current time for the notification
        link: `/dashboard/customer/tasks/${task.id}`,
      });
    });
    
    // Check for unpaid invoices
    const unpaidInvoices = await prisma.invoice.findMany({
      where: {
        clientId: customerId,
        status: {
          in: [InvoiceStatus.UNPAID, InvoiceStatus.OVERDUE],
        },
      },
      orderBy: [
        {
          status: 'desc', // OVERDUE comes before UNPAID alphabetically
        },
        {
          dueDate: 'asc',
        },
      ],
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      take: 3,
    });
    
    unpaidInvoices.forEach(invoice => {
      const isOverdue = invoice.status === InvoiceStatus.OVERDUE;
      const message = isOverdue
        ? `Invoice #${invoice.number} for project ${invoice.project.name} is overdue`
        : `Invoice #${invoice.number} for project ${invoice.project.name} is due on ${invoice.dueDate.toLocaleDateString()}`;
      
      notifications.push({
        id: `inv-${invoice.id}`,
        message,
        read: false,
        time: isOverdue ? invoice.dueDate : new Date(), // Use due date for overdue invoices
        link: `/dashboard/customer/billing`,
      });
    });
    
    // Sort notifications by time (most recent first)
    notifications.sort((a, b) => b.time.getTime() - a.time.getTime());
    
    return notifications;
  }
}