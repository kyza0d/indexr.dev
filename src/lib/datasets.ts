import { db } from './prisma';
import { Dataset } from '@/types';
import { unstable_cache } from 'next/cache';

/**
 * Get a dataset by ID with optimized caching and batching
 */
export async function getDatasetById(id: string, userId?: string | null): Promise<Dataset | null> {
  // Use Next.js cache for the full dataset response
  const fetchDataset = async () => await db.getDataset(id);

  const dataset = await unstable_cache(
    fetchDataset,
    [`dataset-${id}`],
    {
      revalidate: 60,
      tags: [`dataset-${id}`],
    }
  )();

  if (!dataset) {
    return null;
  }

  // Determine if the dataset is saved by the current user
  const isSaved = userId ? dataset.savedBy.some((saved: { userId: string }) => saved.userId === userId) : false;

  return {
    id: dataset.id,
    name: dataset.name,
    description: dataset.description,
    fileType: dataset.fileType,
    fileUrl: dataset.fileUrl,
    isPublic: dataset.isPublic,
    isSaved,
    userId: dataset.user.id,
    userName: dataset.user.name || '',
    createdAt: dataset.createdAt instanceof Date ? dataset.createdAt.toISOString() : new Date(dataset.createdAt).toISOString(),
    updatedAt: dataset.updatedAt instanceof Date ? dataset.updatedAt.toISOString() : new Date(dataset.updatedAt).toISOString(),
    itemCount: dataset.itemCount,
    tags: dataset.tags.map((tag: { id: string; name: string }) => ({
      id: tag.id,
      name: tag.name
    })),
    user: {
      name: dataset.user.name,
      image: dataset.user.image,
    },
  };
}

/**
 * Get recent datasets with optimized query and caching
 */
export async function getRecentDatasets(userId: string, limit: number = 10) {
  const fetchRecent = async () => {
    return db.getRecentDatasets(userId, limit);
  };

  return unstable_cache(
    fetchRecent,
    [`recent-datasets-${userId}-${limit}`],
    {
      revalidate: 30,
      tags: [`user-${userId}-recent`],
    }
  )();
}

/**
 * Record a dataset view with debouncing
 */
export async function recordDatasetView(datasetId: string, userId?: string) {
  if (!userId) return;

  const cacheKey = `view-${datasetId}-${userId}`;

  // Check if we've recorded a view recently
  const recentView = await db.cache.get(cacheKey);
  if (recentView) return;

  // Record the view and set a 5-minute cooldown
  await db.getPrisma().datasetView.create({
    data: {
      datasetId,
      userId,
    },
  });

  db.cache.set(cacheKey, true, 300); // 5 minute cooldown
}

/**
 * Update dataset access patterns
 */
export function invalidateDatasetCache(id: string) {
  db.cache.del(`dataset-${id}`);
  db.clearLoader('dataset');
}
