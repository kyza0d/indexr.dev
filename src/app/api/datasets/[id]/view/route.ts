import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    await prisma.datasetView.upsert({
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording dataset view:', error);
    return NextResponse.json({ error: 'Failed to record dataset view' }, { status: 500 });
  }
}
