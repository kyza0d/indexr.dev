import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma types

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const tags = searchParams.getAll('tag');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 12; // Number of items per page

  try {
    const skip = (page - 1) * pageSize;

    // Explicitly type the 'where' object
    const where: Prisma.DatasetWhereInput = {
      OR: [
        {
          name: {
            contains: query,
            mode: Prisma.QueryMode.insensitive, // Use Prisma.QueryMode enum
          },
        },
        {
          description: {
            contains: query,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
      // Conditionally include the 'tags' filter
      ...(tags.length > 0 && {
        tags: {
          some: {
            name: {
              in: tags,
            },
          },
        },
      }),
    };

    const [datasets, totalCount] = await Promise.all([
      prisma.dataset.findMany({
        where,
        include: {
          tags: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        take: pageSize,
        skip,
      }),
      prisma.dataset.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({ datasets, totalCount, totalPages });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}