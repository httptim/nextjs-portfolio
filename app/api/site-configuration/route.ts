import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

const CONFIG_ID = "main"; // Use a fixed ID for the single configuration record

// GET handler to fetch the site configuration (public)
export async function GET(request: NextRequest) {
  try {
    console.log('Site Configuration API GET called');
    
    let config = await prisma.siteConfiguration.findUnique({
      where: { id: CONFIG_ID },
    });

    // If no config exists yet, return empty defaults
    // The PUT handler will create it on first save
    if (!config) {
       console.log('No site configuration found, returning defaults.');
       return NextResponse.json({
         heroTitle: '',
         heroSubtitle: '',
         heroButtonText: '',
         heroButtonLink: '#',
         aboutHeading: '',
         aboutText: '',
         aboutImageUrl: '',
       });
    }

    console.log('Found site configuration:', config.id);
    return NextResponse.json(config);

  } catch (error) {
    console.error('Error fetching site configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT handler to update the site configuration (admin only)
export async function PUT(request: NextRequest) {
  try {
    console.log('Site Configuration API PUT called');
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      console.warn('Unauthorized attempt to update site configuration');
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Admin role required to update site configuration' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Data to update - filter out any unexpected fields
    const dataToUpdate: Partial<typeof body> = {};
    const allowedFields = ['heroTitle', 'heroSubtitle', 'heroButtonText', 'heroButtonLink', 'aboutHeading', 'aboutText', 'aboutImageUrl'];
    
    for (const field of allowedFields) {
        // Allow empty strings and null, but not undefined
        if (body[field] !== undefined) { 
            dataToUpdate[field] = body[field];
        }
    }

    // Although technically upsert allows empty updates, semantically 
    // it's better to require at least one field if the request is made.
    if (Object.keys(dataToUpdate).length === 0) {
         return NextResponse.json(
            { error: 'Bad Request', details: 'No valid fields provided for update.' },
            { status: 400 }
        );
    }
    
    console.log('Updating site configuration with data:', dataToUpdate);

    // Use upsert: update if exists, create if it doesn't
    const updatedConfig = await prisma.siteConfiguration.upsert({
      where: { id: CONFIG_ID },
      update: dataToUpdate,
      create: {
        id: CONFIG_ID,
        heroTitle: body.heroTitle ?? null,
        heroSubtitle: body.heroSubtitle ?? null,
        heroButtonText: body.heroButtonText ?? null,
        heroButtonLink: body.heroButtonLink ?? null,
        aboutHeading: body.aboutHeading ?? null,
        aboutText: body.aboutText ?? null,
        aboutImageUrl: body.aboutImageUrl ?? null,
        ...dataToUpdate, // Overwrite defaults with provided data
      },
    });

    console.log('Site configuration updated successfully:', updatedConfig.id);
    return NextResponse.json(updatedConfig);

  } catch (error) {
    console.error('Error updating site configuration:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 