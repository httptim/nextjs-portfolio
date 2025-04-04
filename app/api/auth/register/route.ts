// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create the user
    const user = await UserService.createUser({
      email: body.email,
      password: body.password,
      name: body.name,
      company: body.company,
      phone: body.phone,
      role: 'CUSTOMER', // Default to customer role
    });
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to register user' 
      },
      { status: 400 }
    );
  }
}