'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { del } from '@vercel/blob'
import { Dataset } from '@/types'
import cache from '@/lib/cache'

const CACHE_KEY_DATASETS = 'all_datasets'
const CACHE_KEY_USER_DATASETS = 'user_datasets_'

async function getAuthenticatedUser() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  return session.user
}

export async function deleteDataset(id: string) {
  try {
    const user = await getAuthenticatedUser()

    await prisma.$transaction(async (tx) => {
      const dataset = await tx.dataset.findUnique({
        where: { id, userId: user.id },
        include: { tags: true },
      })

      if (!dataset) {
        throw new Error('Dataset not found or you do not have permission to delete it')
      }

      await del(dataset.fileUrl)

      await Promise.all([
        tx.savedDataset.deleteMany({ where: { datasetId: id } }),
        tx.datasetView.deleteMany({ where: { datasetId: id } }),
        tx.dataset.delete({ where: { id } }),
      ])

      await cleanupUnusedTags(tx, dataset.tags)
    })

    invalidateCache()
    revalidatePages(id)

    return { success: true }
  } catch (error) {
    console.error('Error deleting dataset:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete dataset' }
  }
}

async function cleanupUnusedTags(tx: any, tags: { id: string }[]) {
  for (const tag of tags) {
    const tagUsageCount = await tx.dataset.count({
      where: { tags: { some: { id: tag.id } } },
    })
    if (tagUsageCount === 0) {
      await tx.tag.delete({ where: { id: tag.id } })
    }
  }
}

export async function fetchDatasets() {
  const cachedDatasets = cache.get<Dataset[]>(CACHE_KEY_DATASETS)
  if (cachedDatasets) {
    return { datasets: cachedDatasets, error: null }
  }

  try {
    let session = null
    try {
      session = await auth()
    } catch (error) {
      // User is not authenticated; proceed with session as null
    }

    const datasets = await prisma.dataset.findMany({
      where: session?.user?.id
        ? { OR: [{ userId: session.user.id }, { isPublic: true }] }
        : { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        savedBy: {
          select: { userId: true },
        },
      },
    })

    // Add 'isSaved' property and convert Date fields to string
    const datasetsWithIsSaved = datasets.map(dataset => ({
      ...dataset,
      isSaved: session?.user?.id ? dataset.savedBy.some(saved => saved.userId === session.user.id) : false,
      createdAt: dataset.createdAt.toISOString(),
      updatedAt: dataset.updatedAt.toISOString(),
    }))

    cache.set(CACHE_KEY_DATASETS, datasetsWithIsSaved)
    return { datasets: datasetsWithIsSaved, error: null }
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return { datasets: [], error: 'Failed to fetch datasets' }
  }
}

export async function saveDataset(id: string, isSaved: boolean) {
  try {
    const user = await getAuthenticatedUser()

    if (!user?.id) {
      throw new Error('User is not authenticated or missing userId');
    }

    if (isSaved) {
      await prisma.savedDataset.create({
        data: { userId: user.id, datasetId: id },  // user.id is guaranteed to be string now
      })
    } else {
      await prisma.savedDataset.delete({
        where: { userId_datasetId: { userId: user.id, datasetId: id } },
      })
    }

    invalidateCache()
    revalidatePath('/datasets')
    return { success: true }
  } catch (error) {
    console.error('Error saving/unsaving dataset:', error)
    return { success: false, error: 'Failed to save/unsave dataset' }
  }
}

export async function fetchUserDatasets(): Promise<{ datasets: Dataset[], error: string | null }> {
  try {
    const user = await getAuthenticatedUser()
    const cacheKey = `${CACHE_KEY_USER_DATASETS}${user.id}`

    const cachedDatasets = cache.get<Dataset[]>(cacheKey)
    if (cachedDatasets) {
      return { datasets: cachedDatasets, error: null }
    }

    const datasets = await prisma.dataset.findMany({
      where: {
        OR: [
          { userId: user.id },
          { savedBy: { some: { userId: user.id } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true,
        savedBy: {
          select: { userId: true },
        },
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    // Add 'isSaved' property and convert Date fields to string
    const datasetsWithIsSaved = datasets.map(dataset => ({
      ...dataset,
      isSaved: dataset.savedBy.some(saved => saved.userId === user.id),
      createdAt: dataset.createdAt.toISOString(),
      updatedAt: dataset.updatedAt.toISOString(),
    }))

    cache.set(cacheKey, datasetsWithIsSaved)
    return { datasets: datasetsWithIsSaved, error: null }
  } catch (error) {
    console.error('Error fetching user datasets:', error)
    return { datasets: [], error: 'Failed to fetch datasets' }
  }
}

function invalidateCache() {
  cache.del(CACHE_KEY_DATASETS)
  cache.keys().forEach(key => {
    if (key.startsWith(CACHE_KEY_USER_DATASETS)) {
      cache.del(key)
    }
  })
}

function revalidatePages(id: string) {
  revalidatePath('/datasets')
  revalidatePath(`/datasets/${id}`)
  revalidatePath('/')
}
