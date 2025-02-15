import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { getDatasetById, recordDatasetView } from '@/lib/datasets';
import { cache } from 'react';
import { Session } from 'next-auth';
import { PrismaClient } from '@prisma/client';

// Add type predicate for session
function isAuthenticatedSession(session: Session | null): session is Session & { user: { id: string } } {
  return !!session?.user?.id;
}

// Cache individual dataset lookups
const getCachedDataset = cache(async (id: string) => {
  return await getDatasetById(id);
});

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    const userId = isAuthenticatedSession(session) ? session.user.id : null;
    const { id } = params;

    const dataset = await getCachedDataset(id);

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    if (!dataset.isPublic && (!userId || userId !== dataset.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Record view asynchronously - don't wait for it
    if (userId) {
      recordDatasetView(dataset.id, userId).catch(console.error);
    }

    return NextResponse.json(dataset, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
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

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  try {
    const session = await auth();

    if (!isAuthenticatedSession(session)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = params;
    const dataset = await db.getDataset(id);

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    if (dataset.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Use transaction with proper typing
    await db.transaction(async (tx: PrismaClient) => {
      await tx.datasetView.deleteMany({ where: { datasetId: id } });
      await tx.savedDataset.deleteMany({ where: { datasetId: id } });
      await tx.dataset.delete({ where: { id } });
    });

    // Clear caches after successful deletion
    db.clearCache(`dataset-${id}`);
    db.clearLoader('dataset');

    return NextResponse.json({ message: 'Dataset deleted successfully' });
  } catch (error) {
    console.error('Error in dataset deletion route:', error);
    return NextResponse.json({
      error: 'Failed to delete dataset',
      details: (error as Error).message
    }, { status: 500 });
  }
}
