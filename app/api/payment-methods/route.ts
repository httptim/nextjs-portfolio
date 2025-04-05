// app/api/payment-methods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verify that the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // In a real application, you would fetch payment methods from database
    // For now, we'll return the default PayPal method
    
    const paymentMethods = [
      {
        id: 'paypal-default',
        type: 'paypal',
        name: 'PayPal',
        isDefault: true,
      }
    ];
    
    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    
    // In a real application, you would validate and save the payment method details
    // For the current scope, we'll just return a success message
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment method added successfully' 
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}