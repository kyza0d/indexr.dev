import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { deleteDataset } from '@/actions/dataset';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log('Entering GET function for dataset');
  try {
    // Optional authentication
    let session = null;
    try {
      session = await auth();
    } catch (error) {
      // User is not authenticated; proceed without session
    }

    const userId = session?.user?.id;
    const { id } = params;
    console.log('Dataset ID to fetch:', id);

    // Fetch the dataset
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        tags: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, image: true } },
        savedBy: { select: { userId: true } },
      },
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Authorization logic
    if (!dataset.isPublic) {
      // Dataset is private
      if (!userId || userId !== dataset.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Determine if the dataset is saved by the current user
    const isSaved = userId ? dataset.savedBy.some((saved) => saved.userId === userId) : false;

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Error in dataset retrieval route:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch dataset',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log('Entering DELETE function for dataset');
  try {
    const session = await auth();
    console.log('Auth session:', session ? 'exists' : 'does not exist');

    if (!session) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = params;
    console.log('Dataset ID to delete:', id);

    console.log('Attempting to delete dataset');
    const result = await deleteDataset(id);

    if (result.success) {
      console.log('Dataset deleted successfully');
      return NextResponse.json({ message: 'Dataset deleted successfully' });
    } else {
      console.error('Failed to delete dataset:', result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in dataset deletion route:', error);
    return NextResponse.json({
      error: 'Failed to delete dataset',
      details: (error as Error).message
    }, { status: 500 });
  }
}
