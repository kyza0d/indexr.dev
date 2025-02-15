import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(_req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  console.log('Entering POST function for dataset view');
  try {
    let userId: string | null = null;
    try {
      const session = await auth();
      console.log('Auth session:', session ? 'exists' : 'does not exist');
      userId = session?.user?.id || null;
    } catch (error) {
      console.log('User is not authenticated');
    }

    const { id } = params;
    console.log('Dataset ID:', id);

    // Fetch the dataset to check if it is public
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      select: {
        isPublic: true,
        userId: true,
      },
    });

    if (!dataset) {
      console.log('Dataset not found');
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Authorization Logic
    if (!dataset.isPublic) {
      if (!userId) {
        console.log('Unauthorized access by unauthenticated user to private dataset');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (userId !== dataset.userId) {
        console.log('Forbidden access by user:', userId);
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    console.log('Creating dataset view');
    const result = await prisma.datasetView.create({
      data: {
        datasetId: id,
        userId: userId, // This can be null
      },
    });

    console.log('Dataset view recorded successfully:', result);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording dataset view:', error);
    return NextResponse.json(
      {
        error: 'Failed to record dataset view',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
