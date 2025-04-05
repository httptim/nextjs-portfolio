import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma types if needed
import { PortfolioCategory, PortfolioProject } from '@prisma/client'; // Import PortfolioCategory enum and PortfolioProject type

// Define the expected structure for a new portfolio item
interface PortfolioItemData {
  title: string;
  description: string;
  category: string;
  technologies: string[];
  features?: string[];
  demoLink?: string;
  githubLink?: string;
  image?: string;
  timeline?: string;
  status?: string;
  tags?: string[];
  link?: string;
}

// GET handler to fetch all portfolio items (Public)
export async function GET(request: NextRequest) {
  try {
    console.log('Portfolio Items API GET called (Public)');
    // Removed authentication check for public access
    /* 
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to manage portfolio items' },
        { status: 403 }
      );
    }
    */

    const portfolioItems = await prisma.portfolioProject.findMany({
      orderBy: [
        // Add ordering if needed, e.g., by 'order' field then 'createdAt'
        { order: 'asc' },
        { createdAt: 'desc' }, 
      ],
    });

    console.log(`Found ${portfolioItems.length} portfolio items for public view`);
    // Use a consistent key, e.g., 'projects' as expected by client components
    return NextResponse.json({ projects: portfolioItems }); 

  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST handler to create a new portfolio item
export async function POST(request: NextRequest) {
  try {
    console.log('Portfolio Items API POST called');
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to create portfolio items' },
        { status: 403 }
      );
    }

    const body: PortfolioItemData = await request.json();

    // Basic validation (add more as needed)
    if (!body.title || !body.category || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Title, category, and description are required.' },
        { status: 400 }
      );
    }

    // Ensure technologies is an array
    const technologies = Array.isArray(body.technologies) ? body.technologies : [];
    const tags = Array.isArray(body.tags) ? body.tags : [];
    const features = Array.isArray(body.features) ? body.features : [];

    // Validate category against the enum
    const categoryEnumValue = body.category.toUpperCase() as keyof typeof PortfolioCategory;
    if (!(categoryEnumValue in PortfolioCategory)) {
      return NextResponse.json(
        { error: 'Invalid category', details: `Category must be one of ${Object.keys(PortfolioCategory).join(', ')}` },
        { status: 400 }
      );
    }

    const newPortfolioItem = await prisma.portfolioProject.create({
      data: {
        title: body.title,
        description: body.description,
        category: categoryEnumValue, // Use the validated enum value
        technologies: technologies,
        features: features,
        demoUrl: body.demoLink,
        githubUrl: body.githubLink,
        imageUrl: body.image,
        timeline: body.timeline,
        status: body.status,
        tags: tags,
        // link: body.link, // Removed as 'link' does not exist on PortfolioProject model
        // Add other relevant fields from your PortfolioProject model
      },
    });

    console.log('Created new portfolio item:', newPortfolioItem.id);
    // Return the created item, using 'portfolioItem' key for consistency maybe? Or 'project' as client expects? Check client.
    // Let's return 'project' as the client page uses that variable name after creating/saving.
    return NextResponse.json({ project: newPortfolioItem }, { status: 201 }); 

  } catch (error) {
     // Handle potential Prisma errors like unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Example: Unique constraint violation
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Conflict', details: 'A portfolio item with similar unique fields might already exist.' },
          { status: 409 }
        );
      }
    }
    console.error('Error creating portfolio item:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// PUT handler to update an existing portfolio item
export async function PUT(request: NextRequest, context: any) {
  try {
    const id = context.params.id;
    console.log(`Portfolio Items API PUT called for ID: ${id}`);
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to update portfolio items' },
        { status: 403 }
      );
    }

    const body: Partial<PortfolioItemData> = await request.json(); // Use Partial<> as not all fields may be updated

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
    const dataToUpdate: Partial<PortfolioProject> = {};
    if (body.title !== undefined) dataToUpdate.title = body.title;
    if (body.description !== undefined) dataToUpdate.description = body.description;
    if (categoryEnumValue !== undefined) dataToUpdate.category = categoryEnumValue;
    if (body.technologies !== undefined) dataToUpdate.technologies = Array.isArray(body.technologies) ? body.technologies : [];
    if (body.features !== undefined) dataToUpdate.features = Array.isArray(body.features) ? body.features : [];
    if (body.demoLink !== undefined) dataToUpdate.demoUrl = body.demoLink; // Map demoLink to demoUrl
    if (body.githubLink !== undefined) dataToUpdate.githubUrl = body.githubLink; // Map githubLink to githubUrl
    if (body.image !== undefined) dataToUpdate.imageUrl = body.image; // Map image to imageUrl
    if (body.timeline !== undefined) dataToUpdate.timeline = body.timeline;
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.tags !== undefined) dataToUpdate.tags = Array.isArray(body.tags) ? body.tags : [];
    // Do not include 'link' as it does not exist on the model

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
    // Return updated item, using 'project' key as client page expects
    return NextResponse.json({ project: updatedPortfolioItem }); 

  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Example: Record to update not found
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Not Found', details: 'Portfolio item with the specified ID not found.' },
          { status: 404 }
        );
      }
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
export async function DELETE(request: NextRequest, context: any) {
  try {
    const id = context.params.id;
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
      // Example: Record to delete not found
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Not Found', details: 'Portfolio item with the specified ID not found.' },
          { status: 404 }
        );
      }
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