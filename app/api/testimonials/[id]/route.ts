// app/api/testimonials/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

// PUT handler to update a specific testimonial by ID (admin only)
export async function PUT(request: NextRequest, context: any) {
  try {
    const id = context.params.id;
    if (!id) {
        return NextResponse.json({ error: 'Bad Request', details: 'Missing testimonial ID in request path.' }, { status: 400 });
    }
    console.log(`Testimonials API PUT called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      console.warn(`Unauthorized attempt to update testimonial ${id}`);
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to update testimonials' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, rating, clientId, position, company, isActive, order } = body;
    
    const dataToUpdate: Prisma.TestimonialUpdateInput = {};

    // Basic validation and adding fields to update object
    if (content !== undefined) dataToUpdate.content = content;
    if (position !== undefined) dataToUpdate.position = position;
    if (company !== undefined) dataToUpdate.company = company;
    if (isActive !== undefined && typeof isActive === 'boolean') dataToUpdate.isActive = isActive;
    
    if (rating !== undefined) {
      const ratingValue = Number(rating);
      if (!isNaN(ratingValue) && ratingValue >= 1 && ratingValue <= 5) {
        dataToUpdate.rating = ratingValue;
      } else {
        return NextResponse.json({ error: 'Invalid rating', details: 'Rating must be between 1 and 5.' }, { status: 400 });
      }
    }

    if (order !== undefined) {
      const orderValue = Number(order);
      if (!isNaN(orderValue)) {
        dataToUpdate.order = orderValue;
      } else {
        return NextResponse.json({ error: 'Invalid order', details: 'Order must be a number.' }, { status: 400 });
      }
    }
    
    // Check if client exists if clientId is provided for update
    if (clientId !== undefined) {
       if (typeof clientId !== 'string' || !clientId) {
           return NextResponse.json({ error: 'Invalid Client ID', details: 'Client ID must be a non-empty string.' }, { status: 400 });
       }
       const clientExists = await prisma.user.findUnique({ where: { id: clientId } });
       if (!clientExists) {
           return NextResponse.json({ error: 'Client Not Found', details: 'The specified client ID does not exist.' }, { status: 404 });
       }
       dataToUpdate.client = { connect: { id: clientId } }; // Connect to new client
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json(
            { error: 'Bad Request', details: 'No valid fields provided for update.' },
            { status: 400 }
        );
    }

    console.log(`Updating testimonial ${id} with data:`, dataToUpdate);

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: dataToUpdate,
      include: { // Include client data in the response
        client: {
          select: { id: true, name: true, company: true }
        }
      }
    });

    console.log('Testimonial updated successfully:', updatedTestimonial.id);
    return NextResponse.json({ testimonial: updatedTestimonial });

  } catch (error) {
    const idForError = context?.params?.id || '[unknown]';
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Not Found', details: `Testimonial with ID ${idForError} not found.` }, { status: 404 });
    }
    console.error(`Error updating testimonial ${idForError}:`, error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE handler for a specific testimonial by ID (admin only)
export async function DELETE(request: NextRequest, context: any) {
  try {
    const id = context.params.id;
    if (!id) {
        return NextResponse.json({ error: 'Bad Request', details: 'Missing testimonial ID in request path.' }, { status: 400 });
    }
    console.log(`Testimonials API DELETE called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      console.warn(`Unauthorized attempt to delete testimonial ${id}`);
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to delete testimonials' },
        { status: 403 }
      );
    }

    // Prisma delete throws P2025 if record not found, which we catch below
    await prisma.testimonial.delete({
      where: { id },
    });

    console.log('Deleted testimonial:', id);
    return NextResponse.json({ message: 'Testimonial deleted successfully' }, { status: 200 });

  } catch (error) {
    const idForError = context?.params?.id || '[unknown]';
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Record to delete not found
      return NextResponse.json({ error: 'Not Found', details: `Testimonial with ID ${idForError} not found.` }, { status: 404 });
    }
    console.error(`Error deleting testimonial ${idForError}:`, error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}