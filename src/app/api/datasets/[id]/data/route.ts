import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeData } from '@/lib/data-processing';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('Entering GET function for dataset data');
  try {
    const { id } = params;
    console.log('Dataset ID:', id);

    const { searchParams } = new URL(req.url);
    const raw = searchParams.get('raw') === 'true';
    console.log('Raw data requested:', raw);

    console.log('Fetching dataset from database');
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        fileUrl: true,
        fileType: true,
        isPublic: true,
        userId: true,
      },
    });

    if (!dataset) {
      console.log('Dataset not found');
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    console.log('Dataset found:', dataset.name);

    // Check if the dataset is public
    if (!dataset.isPublic) {
      // Dataset is not public; deny access
      console.log('Unauthorized access attempt to a private dataset');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!dataset.fileUrl) {
      console.log('Dataset file URL is missing');
      return NextResponse.json({ error: 'Dataset file URL is missing' }, { status: 500 });
    }

    console.log('Fetching file content from URL:', dataset.fileUrl);
    const response = await fetch(dataset.fileUrl);
    if (!response.ok) {
      console.error(`Failed to fetch file: ${response.statusText}. URL: ${dataset.fileUrl}`);
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.statusText}` },
        { status: response.status }
      );
    }
    const fileContent = await response.text();
    console.log('File content fetched successfully');

    if (raw) {
      console.log('Returning raw file content');
      return new NextResponse(fileContent, {
        headers: { 'Content-Type': dataset.fileType },
      });
    } else {
      console.log('Normalizing data');
      const normalizedData = await normalizeData(fileContent, dataset.fileType);
      console.log('Data normalized successfully');
      return NextResponse.json(normalizedData);
    }
  } catch (error) {
    console.error('Error in dataset data route:', error);
    return NextResponse.json(
      { error: 'Error fetching dataset: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
