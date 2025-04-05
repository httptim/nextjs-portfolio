import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    console.log('Invoices API called');
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('No session found in invoices API');
      return NextResponse.json(
        { error: 'Not authenticated', details: 'No session found' },
        { status: 401 }
      );
    }
    
    if (!session.user || !session.user.id) {
      console.log('User information missing in invoices API');
      return NextResponse.json(
        { error: 'User information missing', details: 'User ID is required' },
        { status: 401 }
      );
    }
    
    // For admin users, fetch all invoices
    if (session.user.role === 'ADMIN') {
      const invoices = await prisma.invoice.findMany({
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Format dates for JSON
      const formattedInvoices = invoices.map(invoice => {
        const customer = invoice.project?.client;
        if (!customer) {
          console.warn(`Invoice ${invoice.id} is missing customer data via project.`);
        }
        return {
          id: invoice.id,
          number: invoice.number,
          amount: invoice.amount,
          status: invoice.status,
          date: invoice.createdAt.toISOString(),
          dueDate: invoice.dueDate.toISOString(),
          project: invoice.project?.name || 'N/A',
          customer: customer ? {
            id: customer.id,
            name: customer.name || 'N/A',
            email: customer.email || 'N/A'
          } : { id: 'unknown', name: 'Unknown Customer', email: ''},
          items: []
        };
      });
      
      console.log(`Found ${formattedInvoices.length} invoices for admin`);
      return NextResponse.json({ invoices: formattedInvoices });
    } else {
      // For non-admin users, redirect to the billing API
      console.log('Non-admin user accessing invoices API, redirecting to billing API');
      
      // Fetch invoices for the specific customer
      const invoices = await prisma.invoice.findMany({
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
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Format dates for JSON
      const formattedInvoices = invoices.map(invoice => {
        const customer = invoice.project?.client;
        if (!customer) {
          console.warn(`Invoice ${invoice.id} is missing customer data via project for customer ${session.user?.id}.`);
        }
        return {
          id: invoice.id,
          number: invoice.number,
          amount: invoice.amount,
          status: invoice.status,
          date: invoice.createdAt.toISOString(),
          dueDate: invoice.dueDate.toISOString(),
          project: invoice.project?.name || 'N/A',
          customer: customer ? {
            id: customer.id,
            name: customer.name || 'N/A',
            email: customer.email || 'N/A'
          } : { id: 'unknown', name: 'Unknown Customer', email: ''},
          items: []
        };
      });
      
      console.log(`Found ${formattedInvoices.length} invoices for customer ${session.user.id}`);
      return NextResponse.json({ invoices: formattedInvoices });
    }
  } catch (error) {
    console.error('Error in invoices API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 