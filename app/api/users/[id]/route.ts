// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify that the user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    if (session.user.role !== 'ADMIN' && session.user.id !== id) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        phone: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in user API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify that the user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    // Only admins can change roles or update other users
    const isAdmin = session.user.role === 'ADMIN';
    const isSelfUpdate = session.user.id === id;
    
    if (!isAdmin && !isSelfUpdate) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    // Get the user to update
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { name, password, role, company, phone } = body;
    
    // Prepare the update data
    const updateData: any = {
      name: name !== undefined ? name : existingUser.name,
      company,
      phone,
    };
    
    // Only admins can update roles
    if (role && isAdmin) {
      updateData.role = role;
    }
    
    // Update password if provided
    if (password) {
      updateData.password = await hash(password, 10);
    }
    
    // Update the user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        phone: true,
        createdAt: true,
      },
    });
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in user API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    // Check if trying to delete the last admin
    if (id !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      
      if (user?.role === 'ADMIN') {
        // Count the number of admin users
        const adminCount = await prisma.user.count({
          where: { role: 'ADMIN' },
        });
        
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot delete the last admin user' },
            { status: 400 }
          );
        }
      }
    } else {
      // Prevent deleting yourself
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }
    
    // Delete the user
    await prisma.user.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in user API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}