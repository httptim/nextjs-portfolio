// app/api/payments/paypal/capture/route.ts
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
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'PayPal Order ID is required' },
        { status: 400 }
      );
    }
    
    // Find the invoice associated with this order
    const invoice = await prisma.invoice.findFirst({
      where: { paypalOrderId: orderId }
    });
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found for this PayPal order' },
        { status: 404 }
      );
    }
    
    // Verify that the invoice belongs to the current user or the user is an admin
    if (invoice.clientId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not authorized to capture payment for this invoice' },
        { status: 403 }
      );
    }
    
    // Capture PayPal order payment
    const captureData = await PayPalService.captureOrder(orderId);
    
    return NextResponse.json(captureData);
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture PayPal payment' },
      { status: 500 }
    );
  }
}