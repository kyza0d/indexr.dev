'use server'

import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { del } from '@vercel/blob'

export async function deleteDataset(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Start a transaction to ensure all operations are performed or none
    await prisma.$transaction(async (tx) => {
      // First, check if the user owns the dataset
      const dataset = await tx.dataset.findUnique({
        where: { id, userId: session.user.id },
        include: { tags: true },
      })

      if (!dataset) {
        throw new Error('Dataset not found or you do not have permission to delete it')
      }

      // Delete the file from Vercel Blob
      try {
        await del(dataset.fileUrl)
      } catch (blobError) {
        console.error('Error deleting file from Vercel Blob:', blobError)
        throw new Error('Failed to delete file from storage')
      }

      // Delete all associated SavedDataset entries
      await tx.savedDataset.deleteMany({
        where: { datasetId: id },
      })

      // Delete all associated DatasetView entries
      await tx.datasetView.deleteMany({
        where: { datasetId: id },
      })

      // Delete the dataset
      await tx.dataset.delete({
        where: { id },
      })

      // Clean up unused tags
      for (const tag of dataset.tags) {
        const tagUsageCount = await tx.dataset.count({
          where: {
            tags: { some: { id: tag.id } },
          },
        })

        if (tagUsageCount === 0) {
          await tx.tag.delete({ where: { id: tag.id } })
        }
      }
    })

    // Revalidate relevant paths
    revalidatePath('/datasets')
    revalidatePath(`/datasets/${id}`)
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error deleting dataset:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete dataset' }
  }
}

export async function fetchDataset(id: string) {
  const session = await auth()

  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id },
    })

    if (!dataset) {
      return { error: 'Dataset not found' }
    }

    // Check if the dataset is public or if the user is authenticated and owns the dataset
    if (!dataset.isPublic && (!session || session.user?.id !== dataset.userId)) {
      return { error: 'Unauthorized' }
    }

    return {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      fileType: dataset.fileType,
      createdAt: dataset.createdAt,
      updatedAt: dataset.updatedAt,
      isPublic: dataset.isPublic,
      userId: dataset.userId,
    }
  } catch (error) {
    console.error('Error fetching dataset:', error)
    return { error: 'Failed to fetch dataset' }
  }
}

export async function fetchDatasets() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  try {
    const datasets = await prisma.dataset.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        tags: true, // Include the tags
      },
    });

    return { datasets, error: null }
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return { datasets: [], error: 'Failed to fetch datasets' }
  }
}

export async function saveDataset(id: string, isSaved: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    if (isSaved) {
      await prisma.savedDataset.create({
        data: {
          userId: session.user.id,
          datasetId: id,
        },
      })
    } else {
      await prisma.savedDataset.delete({
        where: {
          userId_datasetId: {
            userId: session.user.id,
            datasetId: id,
          },
        },
      })
    }

    revalidatePath('/datasets')
    return { success: true }
  } catch (error) {
    console.error('Error saving/unsaving dataset:', error)
    return { success: false, error: 'Failed to save/unsave dataset' }
  }
}
