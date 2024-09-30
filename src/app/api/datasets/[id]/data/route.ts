import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { normalizeData } from '@/lib/data-processing';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  const { id } = params;
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('raw') === 'true';

  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id },
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Check if the dataset is public or if the user is authenticated and owns the dataset
    if (!dataset.isPublic && (!session || !session.user || session.user.id !== dataset.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!dataset.fileUrl) {
      return NextResponse.json({ error: 'Dataset file URL is missing' }, { status: 500 });
    }

    // Fetch the file content directly from the Vercel Blob storage URL
    const response = await fetch(dataset.fileUrl);
    if (!response.ok) {
      console.error(`Failed to fetch file: ${response.statusText}. URL: ${dataset.fileUrl}`);
      return NextResponse.json({ error: `Failed to fetch file: ${response.statusText}` }, { status: response.status });
    }
    const fileContent = await response.text();

    if (raw) {
      return new NextResponse(fileContent, {
        headers: { 'Content-Type': dataset.fileType },
      });
    } else {
      const normalizedData = await normalizeData(fileContent, dataset.fileType);
      return NextResponse.json(normalizedData);
    }
  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json({ error: 'Error fetching dataset: ' + (error as Error).message }, { status: 500 });
  }
}
