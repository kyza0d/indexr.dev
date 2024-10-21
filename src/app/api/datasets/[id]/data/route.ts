import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeData } from '@/lib/data-processing';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import cache from '@/lib/cache';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get('raw') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '1000', 10);

    // Implement caching
    const cacheKey = `dataset:${id}:${raw}:${page}:${pageSize}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return new NextResponse(cachedData as BodyInit, {
        headers: {
          'Content-Type': raw ? 'application/octet-stream' : 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

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
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    if (!dataset.isPublic) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!dataset.fileUrl) {
      return NextResponse.json({ error: 'Dataset file URL is missing' }, { status: 500 });
    }

    const response = await fetch(dataset.fileUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.statusText}` },
        { status: response.status }
      );
    }

    if (raw) {
      const fileContent = await response.arrayBuffer();
      cache.set(cacheKey, fileContent);

      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': dataset.fileType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } else {
      const fileContent = await response.text();
      const normalizedData = await normalizeData(fileContent, dataset.fileType);

      // Implement pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = normalizedData.slice(startIndex, endIndex);

      const jsonResponse = {
        data: paginatedData,
        page,
        pageSize,
        totalItems: normalizedData.length,
      };

      cache.set(cacheKey, JSON.stringify(jsonResponse));

      return NextResponse.json(jsonResponse, {
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }
  } catch (error) {
    console.error('Error in GET route:', error);
    return NextResponse.json(
      { error: 'Error fetching dataset: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
