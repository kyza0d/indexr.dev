import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
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

/**
 * Retrieves datasets associated with a user, including saved datasets.
 * @param userId - The ID of the user.
 * @returns An array of dataset objects.
 */
export async function getUserDatasets(userId: string): Promise<Dataset[]> {
  try {
    const datasets = await prisma.dataset.findMany({
      where: {
        OR: [
          { userId: userId },
          { savedBy: { some: { id: userId } } },
        ],
      },
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
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
      orderBy: { updatedAt: 'desc' },
    })

    // Add 'isSaved' property and format the datasets
    return datasets.map((dataset) => {
      const isSaved = dataset.savedBy.some((user) => user.id === userId)
      return {
        id: dataset.id,
        name: dataset.name,
        description: dataset.description,
        fileType: dataset.fileType,
        fileUrl: dataset.fileUrl,
        isPublic: dataset.isPublic,
        isSaved,
        userId: dataset.userId,
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
    })
  } catch (error) {
    console.error('Error fetching user datasets:', error)
    return []
  }
}

interface SearchDatasetsParams {
  query: string
  tags: string[]
  page: number
  limit: number
}

/**
 * Searches for datasets based on query and tags, paginated.
 * @param params - Search parameters.
 * @returns An object containing datasets and total count.
 */
export async function searchDatasets({
  query,
  tags,
  page,
  limit,
}: SearchDatasetsParams): Promise<{ datasets: Dataset[]; totalCount: number }> {
  const session = await auth()
  const userId = session?.user?.id

  const skip = (page - 1) * limit

  const whereClause: Prisma.DatasetWhereInput = {
    OR: [
      { isPublic: true },
      { userId: userId },
    ],
    AND: [
      query
        ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }
        : {},
      tags.length > 0
        ? { tags: { some: { name: { in: tags } } } }
        : {},
    ],
  }

  const [datasets, totalCount] = await Promise.all([
    prisma.dataset.findMany({
      where: whereClause,
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
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
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.dataset.count({ where: whereClause }),
  ])

  // Format datasets and add 'isSaved' property
  const formattedDatasets = datasets.map((dataset) => {
    const isSaved = dataset.savedBy.some((user) => user.id === userId)
    return {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      fileType: dataset.fileType,
      fileUrl: dataset.fileUrl,
      isPublic: dataset.isPublic,
      isSaved,
      userId: dataset.userId,
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
  })

  return {
    datasets: formattedDatasets,
    totalCount,
  }
}

/**
 * Retrieves all available tags.
 * @returns An array of tag names.
 */
export async function getAllTags(): Promise<string[]> {
  const tags = await prisma.tag.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  })
  return tags.map((tag) => tag.name)
}

/**
 * Retrieves datasets with pagination and optional search query.
 * @param page - The page number.
 * @param query - The search query.
 * @param pageSize - The number of items per page.
 * @returns An object containing datasets and total pages.
 */
export async function getPaginatedDatasets(
  page: number = 1,
  query: string = '',
  pageSize: number = 12
): Promise<{ datasets: Dataset[]; totalPages: number }> {
  const skip = (page - 1) * pageSize

  const where: Prisma.DatasetWhereInput = query
    ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { some: { name: { contains: query, mode: 'insensitive' } } } },
      ],
    }
    : {}

  const [datasets, totalCount] = await Promise.all([
    prisma.dataset.findMany({
      where,
      include: {
        tags: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
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
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.dataset.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  // Format datasets and add 'isSaved' property
  const formattedDatasets = datasets.map((dataset) => ({
    id: dataset.id,
    name: dataset.name,
    description: dataset.description,
    fileType: dataset.fileType,
    fileUrl: dataset.fileUrl,
    isPublic: dataset.isPublic,
    isSaved: false, // Assuming 'isSaved' is false since we don't have user context here
    userId: dataset.userId,
    userName: dataset.user.name || '',
    createdAt: dataset.createdAt.toISOString(),
    updatedAt: dataset.updatedAt.toISOString(),
    itemCount: dataset.itemCount,
    tags: dataset.tags.map((tag) => ({ id: tag.id, name: tag.name })),
    user: {
      name: dataset.user.name,
      image: dataset.user.image,
    },
  }))

  return {
    datasets: formattedDatasets,
    totalPages,
  }
}
