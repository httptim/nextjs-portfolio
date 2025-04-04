// app/api/testimonials/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the testimonial
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
            company: true,
          },
        },
      },
    });
    
    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }
    
    // For public access, only return active testimonials
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      if (!testimonial.isActive) {
        return NextResponse.json(
          { error: 'Testimonial not found' },
          { status: 404 }
        );
      }
    }
    
    // Format the response
    const formattedTestimonial = {
      id: testimonial.id,
      content: testimonial.content,
      rating: testimonial.rating,
      clientName: testimonial.client.name,
      position: testimonial.position,
      company: testimonial.company || testimonial.client.company,
      ...(session?.user.role === 'ADMIN' && {
        clientId: testimonial.clientId,
        isActive: testimonial.isActive,
        order: testimonial.order,
        createdAt: testimonial.createdAt,
      }),
    };
    
    return NextResponse.json({ testimonial: formattedTestimonial });
  } catch (error) {
    console.error('Error in testimonial API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    const id = params.id;
    
    // Check if the testimonial exists
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });
    
    if (!existingTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    const { content, rating, clientId, position, company, isActive, order } = body;
    
    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }
    
    // Validate rating
    const ratingValue = Number(rating);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }
    
    // Check if the client exists if clientId is provided
    if (clientId && clientId !== existingTestimonial.clientId) {
      const client = await prisma.user.findUnique({
        where: { id: clientId },
      });
      
      if (!client) {
        return NextResponse.json(
          { error: 'Client not found' },
          { status: 404 }
        );
      }
    }
    
    // Update the testimonial
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        content,
        rating: ratingValue,
        clientId: clientId || existingTestimonial.clientId,
        position,
        company,
        isActive: isActive !== undefined ? isActive : existingTestimonial.isActive,
        order: order !== undefined ? order : existingTestimonial.order,
      },
    });
    
    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error('Error in testimonial API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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
    
    const id = params.id;
    
    // Check if the testimonial exists
    const existingTestimonial = await prisma.testimonial.findUnique({
      where: { id },
    });
    
    if (!existingTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }
    
    // Delete the testimonial
    await prisma.testimonial.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in testimonial API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}