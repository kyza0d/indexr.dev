import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import cache from '@/lib/cache'
import { cache as reactCache } from 'react'

const CACHE_KEY = 'user_datasets_'
const CACHE_TTL = 300 // 5 minutes

// Cache the dataset query using React's cache
const getCachedDatasets = reactCache(async (userId: string) => {
  return await prisma.dataset.findMany({
    where: {
      OR: [
        { userId },
        {
          savedBy: {
            some: { userId }
          }
        }
      ]
    },
    select: {
      id: true,
      name: true,
      description: true,
      fileType: true,
      isPublic: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      itemCount: true,
      tags: {
        select: {
          id: true,
          name: true
        }
      },
      savedBy: {
        where: { userId },
        select: { id: true }
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
});

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const cacheKey = `${CACHE_KEY}${userId}`

    // Check node-cache first
    const cachedData = cache.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // If not in node-cache, use React's cache to fetch
    const datasets = await getCachedDatasets(userId)

    const formattedDatasets = datasets.map(dataset => ({
      ...dataset,
      isSaved: dataset.savedBy.length > 0,
      savedBy: undefined, // Remove savedBy from response
      createdAt: dataset.createdAt.toISOString(),
      updatedAt: dataset.updatedAt.toISOString(),
      user: {
        id: dataset.user.id,
        name: dataset.user.name,
        image: dataset.user.image,
      },
    }))

    // Store in node-cache
    cache.set(cacheKey, formattedDatasets, CACHE_TTL)

    return NextResponse.json(formattedDatasets)
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch datasets'
    }, { status: 500 })
  }
}
