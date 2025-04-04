// app/api/testimonials/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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
    
    // Get all testimonials with client information
    const testimonials = await prisma.testimonial.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
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
      clientId: testimonial.clientId,
      clientName: testimonial.client.name,
      clientEmail: testimonial.client.email,
      position: testimonial.position,
      company: testimonial.company || testimonial.client.company,
      isActive: testimonial.isActive,
      order: testimonial.order,
      createdAt: testimonial.createdAt,
    }));
    
    return NextResponse.json({ testimonials: formattedTestimonials });
  } catch (error) {
    console.error('Error in testimonials admin API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}