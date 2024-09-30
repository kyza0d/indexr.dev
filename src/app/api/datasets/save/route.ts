// src/app/api/datasets/save/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { datasetId } = await req.json()

  try {
    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
    })

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    if (!dataset.isPublic) {
      return NextResponse.json({ error: 'Dataset is not public' }, { status: 403 })
    }

    const savedDataset = await prisma.savedDataset.upsert({
      where: {
        userId_datasetId: {
          userId: session.user.id,
          datasetId: dataset.id,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        datasetId: dataset.id,
      },
    })

    return NextResponse.json(savedDataset)
  } catch (error) {
    console.error('Error saving dataset:', error)
    return NextResponse.json({ error: 'Failed to save dataset' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { datasetId } = await req.json()

  try {
    await prisma.savedDataset.delete({
      where: {
        userId_datasetId: {
          userId: session.user.id,
          datasetId: datasetId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unsaving dataset:', error)
    return NextResponse.json({ error: 'Failed to unsave dataset' }, { status: 500 })
  }
}
