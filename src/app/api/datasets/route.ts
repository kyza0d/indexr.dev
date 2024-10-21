import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import cache from '@/lib/cache'

const CACHE_KEY = 'user_datasets_'
const CACHE_TTL = 300 // 5 minutes

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cacheKey = `${CACHE_KEY}${session.user.id}`

  try {
    // Try to get data from cache
    const cachedData = cache.get(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    // If not in cache, fetch from database
    const datasets = await prisma.dataset.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          {
            savedBy: {
              some: { userId: session.user.id }
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
          where: { userId: session.user.id },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedDatasets = datasets.map(dataset => ({
      ...dataset,
      isSaved: dataset.savedBy.length > 0,
      savedBy: undefined,
      createdAt: dataset.createdAt.toISOString(),
      updatedAt: dataset.updatedAt.toISOString(),
    }))

    // Store in cache
    cache.set(cacheKey, formattedDatasets, CACHE_TTL)

    return NextResponse.json(formattedDatasets)
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json({ error: 'Failed to fetch datasets' }, { status: 500 })
  }
}
