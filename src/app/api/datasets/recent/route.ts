import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getRecentDatasets } from '@/lib/datasets';

export async function GET(req: NextRequest) {
  // Auth check happens outside of cached function
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get('limit')) || 5;

  try {
    // Pass userId to cached function
    const recentDatasets = await getRecentDatasets(session.user.id, limit);

    return NextResponse.json(recentDatasets, {
      headers: {
        'Cache-Control': 'private, s-maxage=30',
      },
    });
  } catch (error) {
    console.error('Error fetching recent datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent datasets' },
      { status: 500 }
    );
  }
}
