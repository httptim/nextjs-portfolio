import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma types if needed
import { PortfolioCategory } from '@prisma/client'; // Import PortfolioCategory enum

// Define the expected structure for a NEW portfolio item for POST
// Keep this specific to POST requirements
interface NewPortfolioItemData {
  title: string;
  description: string;
  category: string; // Client sends string, we validate and convert to enum
  technologies?: string[] | string; // Client might send string or array initially? handle both.
  features?: string[] | string;
  demoUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  timeline?: string;
  status?: string;
  tags?: string[] | string;
  order?: number; // Added order
}


// GET handler to fetch all portfolio items (Public)
export async function GET(request: NextRequest) {
  try {
    console.log('Portfolio Items API GET called (Public)');
    
    const portfolioItems = await prisma.portfolioProject.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }, 
      ],
    });

    console.log(`Found ${portfolioItems.length} portfolio items for public view`);
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

    const body: NewPortfolioItemData = await request.json();

    // Basic validation 
    if (!body.title || !body.category || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Title, category, and description are required.' },
        { status: 400 }
      );
    }

    // Ensure array fields are arrays (handling potential string input)
    const ensureArray = (field: string[] | string | undefined): string[] => {
       if (field === undefined) return [];
       if (Array.isArray(field)) return field;
       if (typeof field === 'string') return field.split(',').map(s => s.trim()).filter(Boolean);
       return [];
    };
    
    const technologies = ensureArray(body.technologies);
    const tags = ensureArray(body.tags);
    const features = ensureArray(body.features);

    // Validate category against the enum
    const categoryEnumValue = body.category.toUpperCase() as keyof typeof PortfolioCategory;
    if (!(categoryEnumValue in PortfolioCategory)) {
      return NextResponse.json(
        { error: 'Invalid category', details: `Category must be one of ${Object.keys(PortfolioCategory).join(', ')}` },
        { status: 400 }
      );
    }
    
    // Ensure order is a number
    const order = typeof body.order === 'string' ? parseInt(body.order, 10) : (body.order ?? 0);

    const newPortfolioItem = await prisma.portfolioProject.create({
      data: {
        title: body.title,
        description: body.description,
        category: categoryEnumValue, 
        technologies: technologies,
        features: features,
        demoUrl: body.demoUrl || null,
        githubUrl: body.githubUrl || null,
        imageUrl: body.imageUrl || null,
        timeline: body.timeline || null,
        status: body.status || null,
        tags: tags,
        order: isNaN(order) ? 0 : order,
      },
    });

    console.log('Created new portfolio item:', newPortfolioItem.id);
    return NextResponse.json({ project: newPortfolioItem }, { status: 201 }); 

  } catch (error) {
     // Handle potential Prisma errors like unique constraint violations
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Conflict', details: 'A portfolio item with similar unique fields might already exist.' },
          { status: 409 }
        );
      }
       // Log other Prisma errors
       console.error('Prisma error during create:', error);
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

// PUT and DELETE handlers removed from this file. They are now in [id]/route.ts 