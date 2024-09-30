import { prisma } from '@/lib/prisma'
import { Dataset } from '@/types'
import { auth } from '@/auth'

export async function getDatasetById(id: string): Promise<Dataset | null> {
  const dataset = await prisma.dataset.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!dataset) {
    return null
  }

  return {
    ...dataset,
    userId: dataset.user.id,
    userName: dataset.user.name || '',
  }
}


export async function getUserDatasets(userId: string) {
  try {
    const datasets = await prisma.dataset.findMany({
      where: {
        OR: [
          { userId: userId },
          { savedBy: { some: { id: userId } } }
        ]
      },
      include: {
        tags: true,
        user: {
          select: { name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
    return datasets
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

export async function searchDatasets({
  query,
  tags,
  page,
  limit,
}: SearchDatasetsParams): Promise<{ datasets: Dataset[]; totalCount: number }> {
  const session = await auth()
  const userId = session?.user?.id

  const skip = (page - 1) * limit

  const whereClause: any = {
    AND: [
      {
        OR: [
          { isPublic: true },
          { userId: userId },
        ],
      },
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
        tags: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.dataset.count({ where: whereClause }),
  ])

  return {
    datasets: datasets.map(dataset => ({
      ...dataset,
      tags: dataset.tags.map(tag => tag.name),
      user: dataset.user ? {
        name: dataset.user.name,
        image: dataset.user.image,
      } : null,
    })),
    totalCount,
  }
}

export async function getAllTags(): Promise<string[]> {
  const tags = await prisma.tag.findMany({
    select: { name: true },
    orderBy: { name: 'asc' },
  })
  return tags.map(tag => tag.name)
}

export async function getPaginatedDatasets(page: number = 1, query: string = '', pageSize: number = 12) {
  const skip = (page - 1) * pageSize

  const where = query
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
        tags: true,
        user: {
          select: { name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.dataset.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    datasets,
    totalPages,
  }
}
