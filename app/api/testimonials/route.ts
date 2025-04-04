// app/api/testimonials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get active testimonials for public view
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isActive: true,
      },
      include: {
        client: {
          select: {
            name: true,
            company: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    
    // Transform the data for the frontend
    const formattedTestimonials = testimonials.map(testimonial => ({
      id: testimonial.id,
      content: testimonial.content,
      rating: testimonial.rating,
      clientName: testimonial.client.name,
      position: testimonial.position,
      company: testimonial.company || testimonial.client.company,
    }));
    
    return NextResponse.json({ testimonials: formattedTestimonials });
  } catch (error) {
    console.error('Error in testimonials API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
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
    
    // Check if the client exists
    const client = await prisma.user.findUnique({
      where: { id: clientId },
    });
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    // Create the testimonial
    const testimonial = await prisma.testimonial.create({
      data: {
        content,
        rating: ratingValue,
        clientId,
        position,
        company,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });
    
    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error('Error in testimonials API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}