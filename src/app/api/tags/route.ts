import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  try {
    type Tag = { id: string; name: string };
    let tags: Tag[];
    if (query) {
      tags = await prisma.tag.findMany({
        where: {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        select: { id: true, name: true },
        take: 10,
        orderBy: {
          name: 'asc',
        },
      })
    } else {
      tags = await prisma.tag.findMany({
        select: { id: true, name: true },
        orderBy: {
          name: 'asc',
        },
      })
    }

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'An error occurred while fetching tags' }, { status: 500 })
  }
}
