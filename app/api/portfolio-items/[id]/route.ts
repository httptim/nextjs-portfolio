import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma types if needed
import { PortfolioCategory, PortfolioProject } from '@prisma/client'; // Import PortfolioCategory enum and PortfolioProject type

// Define the expected structure for UPDATING a portfolio item (can be partial)
interface PortfolioItemUpdateData {
  title?: string;
  description?: string;
  category?: string; // Client sends string, we validate and convert to enum
  technologies?: string[] | string; // Handle string or array
  features?: string[] | string;
  demoLink?: string;
  githubLink?: string;
  image?: string;
  timeline?: string;
  status?: string;
  tags?: string[] | string;
  order?: number | string; // Can receive number or string
}

// Helper function to ensure array fields are arrays
const ensureArray = (field: string[] | string | undefined): string[] => {
  if (field === undefined) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') return field.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

// PUT handler to update an existing portfolio item
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', details: 'Missing project ID.' }, { status: 400 });
    }
    console.log(`Portfolio Items API PUT called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to update portfolio items' },
        { status: 403 }
      );
    }

    const body: PortfolioItemUpdateData = await request.json(); 

    // Validate category if provided
    let categoryEnumValue: PortfolioCategory | undefined = undefined;
    if (body.category) {
      const rawCategory = body.category.toUpperCase() as keyof typeof PortfolioCategory;
      if (!(rawCategory in PortfolioCategory)) {
        return NextResponse.json(
          { error: 'Invalid category', details: `Category must be one of ${Object.keys(PortfolioCategory).join(', ')}` },
          { status: 400 }
        );
      }
      categoryEnumValue = rawCategory;
    }

    // Prepare data, only including fields that were actually sent in the body
    const dataToUpdate: Partial<Omit<PortfolioProject, 'id' | 'createdAt' | 'updatedAt'>> = {};
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (categoryEnumValue !== undefined) dataToUpdate.category = categoryEnumValue;
    if (body.technologies !== undefined) dataToUpdate.technologies = ensureArray(body.technologies);
    if (body.features !== undefined) dataToUpdate.features = ensureArray(body.features);
    if (body.demoLink !== undefined) dataToUpdate.demoUrl = body.demoLink; // Map client name to schema name
    if (body.githubLink !== undefined) dataToUpdate.githubUrl = body.githubLink; // Map client name to schema name
    if (body.image !== undefined) dataToUpdate.imageUrl = body.image; // Map client name to schema name
    if (body.timeline !== undefined) dataToUpdate.timeline = body.timeline;
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.tags !== undefined) dataToUpdate.tags = ensureArray(body.tags);
    if (body.order !== undefined) { // Handle order update
      const order = typeof body.order === 'string' ? parseInt(body.order, 10) : body.order;
      if (!isNaN(order)) {
         dataToUpdate.order = order;
      }
    }

    if (Object.keys(dataToUpdate).length === 0) {
       return NextResponse.json(
        { error: 'Bad Request', details: 'No valid fields provided for update.' },
        { status: 400 }
      );
    }

    const updatedPortfolioItem = await prisma.portfolioProject.update({
      where: { id },
      data: dataToUpdate,
    });

    console.log('Updated portfolio item:', updatedPortfolioItem.id);
    return NextResponse.json({ project: updatedPortfolioItem }); 

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Not Found', details: 'Portfolio item with the specified ID not found.' },
          { status: 404 }
        );
      }
       // Log other Prisma errors
       console.error('Prisma error during update:', error);
    }
    console.error('Error updating portfolio item:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a portfolio item
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
     const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Bad Request', details: 'Missing project ID.' }, { status: 400 });
    }
    console.log(`Portfolio Items API DELETE called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to delete portfolio items' },
        { status: 403 }
      );
    }

    await prisma.portfolioProject.delete({
      where: { id },
    });

    console.log('Deleted portfolio item:', id);
    return NextResponse.json({ message: 'Portfolio item deleted successfully' }, { status: 200 }); 

  } catch (error) {
     if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Not Found', details: 'Portfolio item with the specified ID not found.' },
          { status: 404 }
        );
      }
       // Log other Prisma errors
       console.error('Prisma error during delete:', error);
    }
    console.error('Error deleting portfolio item:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 