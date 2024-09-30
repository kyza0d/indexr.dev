// src/app/api/datasets/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const datasets = await prisma.dataset.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          {
            savedBy: {
              some: { userId: session.user.id }
            }
          }
        ]
      },
      include: {
        savedBy: {
          where: { userId: session.user.id },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedDatasets = datasets.map(dataset => ({
      ...dataset,
      isSaved: dataset.savedBy.length > 0,
      savedBy: undefined,
    }))

    return NextResponse.json(formattedDatasets)
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json({ error: 'Failed to fetch datasets' }, { status: 500 })
  }
}
