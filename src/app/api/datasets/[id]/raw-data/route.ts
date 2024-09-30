import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

const CHUNK_SIZE = 1000;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';

    console.log('Fetching dataset with id:', id);
    const dataset = await prisma.dataset.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!dataset) {
      console.log('Dataset not found for id:', id);
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    if (!dataset.fileUrl) {
      console.log('Dataset file URL is missing for id:', id);
      return NextResponse.json({ error: 'Dataset file URL is missing' }, { status: 500 });
    }

    console.log('Fetching file content from URL:', dataset.fileUrl);
    const fileResponse = await fetch(dataset.fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
    }
    const fileContent = await fileResponse.text();

    const lines = fileContent.split('\n');
    let lineCount = 0;
    let dataChunk: string[] = [];
    let totalRows = lines.length;
    let fileSize = Buffer.byteLength(fileContent, 'utf8');

    for (const line of lines) {
      if (search && !line.toLowerCase().includes(search.toLowerCase())) {
        continue;
      }

      lineCount++;
      if (lineCount > (page - 1) * CHUNK_SIZE && lineCount <= page * CHUNK_SIZE) {
        dataChunk.push(line);
      }

      if (lineCount > page * CHUNK_SIZE) {
        break;
      }
    }

    const hasMore = lineCount > page * CHUNK_SIZE;

    console.log('Successfully processed dataset. Rows:', totalRows, 'File size:', fileSize);
    return NextResponse.json({
      data: dataChunk,
      hasMore,
      summary: {
        totalRows,
        fileSize: `${(fileSize / (1024 * 1024)).toFixed(2)} MB`,
      },
    });
  } catch (error) {
    console.error('Error in raw-data route:', error);
    return NextResponse.json({ error: 'Error fetching raw dataset: ' + (error as Error).message }, { status: 500 });
  }
}
