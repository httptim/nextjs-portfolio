// app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify that the user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { clientId, projectId, dueDate, items } = body;
    
    // Validate required fields
    if (!clientId || !projectId || !dueDate || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate that client and project exist
    const client = await prisma.user.findUnique({
      where: { id: clientId, role: 'CUSTOMER' }
    });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    const project = await prisma.project.findFirst({
      where: { id: projectId, clientId: clientId }
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or does not belong to client' },
        { status: 404 }
      );
    }
    
    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    
    // Generate an invoice number
    const invoiceCount = await prisma.invoice.count();
    const currentYear = new Date().getFullYear();
    const invoiceNumber = `INV-${currentYear}-${(invoiceCount + 1).toString().padStart(3, '0')}`;
    
    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        amount: totalAmount,
        status: 'UNPAID',
        date: new Date(),
        dueDate: new Date(dueDate),
        projectId,
        clientId,
        items: {
          create: items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate
          }))
        }
      }
    });
    
    return NextResponse.json({
      id: invoice.id,
      number: invoice.number,
      amount: invoice.amount,
      status: invoice.status,
      date: invoice.date,
      dueDate: invoice.dueDate
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}