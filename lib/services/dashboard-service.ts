// lib/services/dashboard-service.ts
import { prisma } from '../prisma';
import { Role } from '@prisma/client';

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
  type: 'task' | 'message' | 'payment' | 'project' | 'invoice';
  action: string;
  project: string | null;
  customer: string | null;
  timestamp: Date;
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
      where: { status: 'ACTIVE' },
    });
    
    const completedProjects = await prisma.project.count({
      where: { status: 'COMPLETED' },
    });
    
    // Get task stats
    const tasksCompleted = await prisma.task.count({
      where: { status: 'COMPLETED' },
    });
    
    const pendingTasks = await prisma.task.count({
      where: {
        status: {
          in: ['TODO', 'IN_PROGRESS', 'REVIEW'],
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
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
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
        status: 'ACTIVE',
      },
    });
    
    const completedProjects = await prisma.project.count({
      where: {
        clientId: customerId,
        status: 'COMPLETED',
      },
    });
    
    // Get task stats
    const tasksCompleted = await prisma.task.count({
      where: {
        project: {
          clientId: customerId,
        },
        status: 'COMPLETED',
      },
    });
    
    const pendingTasks = await prisma.task.count({
      where: {
        project: {
          clientId: customerId,
        },
        status: {
          in: ['TODO', 'IN_PROGRESS', 'REVIEW'],
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
          in: ['TODO', 'IN_PROGRESS', 'REVIEW'],
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
          in: ['UNPAID', 'OVERDUE'],
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
        status: 'COMPLETED',
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
    
    const taskActivities: RecentActivity[] = recentTasks.map(task => ({
      id: `task-${task.id}`,
      type: 'task',
      action: `Task "${task.title}" was completed`,
      project: task.project.name,
      customer: task.project.client.name,
      timestamp: task.updatedAt,
    }));
    
    // Get recent messages
    const recentMessages = await prisma.message.findMany({
      where: {
        sender: {
          role: 'CUSTOMER',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        sender: {
          select: {
            name: true,
          },
        },
        conversation: {
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
    
    const messageActivities: RecentActivity[] = recentMessages.map(message => ({
      id: `message-${message.id}`,
      type: 'message',
      action: `Message received from ${message.sender.name}`,
      project: message.conversation.project?.name || null,
      customer: message.sender.name,
      timestamp: message.createdAt,
    }));
    
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
    
    // Combine all activities, sort by timestamp, and limit
    const allActivities = [...taskActivities, ...messageActivities, ...paymentActivities];
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
    
    const taskActivities: RecentActivity[] = recentTasks.map(task => ({
      id: `task-${task.id}`,
      type: 'task',
      action: `Task "${task.title}" was ${task.status.toLowerCase().replace('_', ' ')}`,
      project: task.project.name,
      customer: null,
      timestamp: task.updatedAt,
    }));
    
    // Get project milestone updates
    const projectActivities: RecentActivity[] = [];
    
    // Get recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      where: {
        clientId: customerId,
      },
      orderBy: {
        date: 'desc',
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
    
    const invoiceActivities: RecentActivity[] = recentInvoices.map(invoice => ({
      id: `invoice-${invoice.id}`,
      type: 'invoice',
      action: `Invoice #${invoice.number} (${invoice.status.toLowerCase()}) for $${invoice.amount.toFixed(2)}`,
      project: invoice.project.name,
      customer: null,
      timestamp: invoice.date,
    }));
    
    // Combine all activities, sort by timestamp, and limit
    const allActivities = [...taskActivities, ...projectActivities, ...invoiceActivities];
    allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return allActivities.slice(0, limit);
  }
}