// app/api/payments/paypal/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { PayPalService } from '@/lib/services/paypal-service';
import { prisma } from '@/lib/prisma';

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
    
    // Get request body
    const body = await request.json();
    const { invoiceId } = body;
    
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }
    
    // Verify that the invoice belongs to the current user or the user is an admin
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    });
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    if (invoice.clientId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to pay this invoice' },
        { status: 403 }
      );
    }
    
    // Create PayPal order
    const orderData = await PayPalService.createOrder(invoiceId);
    
    return NextResponse.json(orderData);
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}