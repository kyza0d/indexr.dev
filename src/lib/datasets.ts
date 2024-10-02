import { prisma } from '@/lib/prisma'
import { Dataset } from '@/types'
import { auth } from '@/auth'

/**
 * Retrieves a dataset by its ID, including user and tags information.
 * @param id - The ID of the dataset.
 * @returns The dataset object or null if not found.
 */
export async function getDatasetById(id: string): Promise<Dataset | null> {
  const session = await auth()
  const userId = session?.user?.id

  const dataset = await prisma.dataset.findUnique({
    where: { id },
    include: {
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      savedBy: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!dataset) {
    return null
  }

  // Determine if the dataset is saved by the current user
  const isSaved = dataset.savedBy.some((user) => user.id === userId)

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
    createdAt: dataset.createdAt.toISOString(),
    updatedAt: dataset.updatedAt.toISOString(),
    itemCount: dataset.itemCount,
    tags: dataset.tags.map((tag) => ({ id: tag.id, name: tag.name })),
    user: {
      name: dataset.user.name,
      image: dataset.user.image,
    },
  }
}
