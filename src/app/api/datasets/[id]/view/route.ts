import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  console.log('Entering POST function for dataset view');
  try {
    const session = await auth();
    console.log('Auth session:', session ? 'exists' : 'does not exist');

    if (!session?.user?.id) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    console.log('Dataset ID:', id);

    console.log('Upserting dataset view');
    const result = await prisma.datasetView.upsert({
      where: {
        datasetId_userId: {
          datasetId: id,
          userId: session.user.id,
        },
      },
      update: {
        viewedAt: new Date(),
      },
      create: {
        datasetId: id,
        userId: session.user.id,
      },
    });

    console.log('Dataset view upserted successfully:', result);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording dataset view:', error);
    return NextResponse.json({
      error: 'Failed to record dataset view',
      details: (error as Error).message
    }, { status: 500 });
  }
}
