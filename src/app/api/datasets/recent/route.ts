// src/app/api/datasets/recent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get('limit')) || 5;

  try {
    const recentDatasets = await prisma.dataset.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { isPublic: true },
          {
            views: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      orderBy: [
        { updatedAt: 'desc' }
      ],
      include: {
        views: {
          where: {
            userId: session.user.id
          },
          orderBy: {
            viewedAt: 'desc'
          },
          take: 1
        }
      },
      take: limit * 2 // Fetch more than needed to account for sorting
    });

    // Sort the datasets based on the most recent view or update
    const sortedDatasets = recentDatasets.sort((a, b) => {
      const aDate = a.views[0]?.viewedAt || a.updatedAt;
      const bDate = b.views[0]?.viewedAt || b.updatedAt;
      return bDate.getTime() - aDate.getTime();
    });

    // Take only the required number of datasets and format the response
    const formattedDatasets = sortedDatasets.slice(0, limit).map(dataset => ({
      id: dataset.id,
      name: dataset.name,
      fileType: dataset.fileType,
      updatedAt: dataset.updatedAt.toISOString(),
      isPublic: dataset.isPublic,
      userId: dataset.userId
    }));

    return NextResponse.json(formattedDatasets);
  } catch (error) {
    console.error('Error fetching recent datasets:', error);
    return NextResponse.json({ error: 'Failed to fetch recent datasets' }, { status: 500 });
  }
}
