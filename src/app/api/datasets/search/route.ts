import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@/auth'; // Import your authentication function

export async function GET(req: NextRequest) {
  // Get the current user's session
  const session = await auth();
  const userId = session?.user?.id || null;

  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const tags = searchParams.getAll('tag');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 12;

  try {
    const skip = (page - 1) * pageSize;

    // Build the 'where' conditions
    const whereConditions: Prisma.DatasetWhereInput[] = [];

    // Visibility filter: include public datasets and user's own datasets
    if (userId) {
      whereConditions.push({
        OR: [
          { isPublic: true },
          { userId: userId },
        ],
      });
    } else {
      whereConditions.push({
        isPublic: true,
      });
    }

    // Search query filter
    if (query) {
      whereConditions.push({
        OR: [
          {
            name: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            description: {
              contains: query,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      });
    }

    // Tags filter - ensure ALL requested tags are present
    if (tags.length > 0) {
      whereConditions.push({
        AND: tags.map(tag => ({
          tags: {
            some: {
              name: {
                equals: tag,
                mode: Prisma.QueryMode.insensitive,
              }
            }
          }
        }))
      });
    }

    // Combine all conditions
    const where: Prisma.DatasetWhereInput = {
      AND: whereConditions,
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
