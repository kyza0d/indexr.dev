import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/auth';
import { db } from '@/lib/prisma';
import { z } from 'zod';

const UploadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  tags: z.array(z.string()),
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
  }),
  isPublic: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const tags = JSON.parse(formData.get('tags') as string);
    const isPublic = formData.get('isPublic') === 'true';

    // Validate input data
    const validatedData = UploadSchema.parse({
      name,
      description,
      tags,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
      },
      isPublic,
    });

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Upload file to Vercel Blob
    const blob = await put(`datasets/${file.name}`, file, {
      access: 'public',
    });

    // Use a transaction to ensure data consistency
    const dataset = await db.getPrisma().$transaction(async (tx) => {
      // Create or connect tags
      const tagConnections = await Promise.all(
        validatedData.tags.map(async (tagName) => {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            create: { name: tagName },
            update: {},
          });
          return tag;
        })
      );

      // Create the dataset
      return tx.dataset.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          fileType: validatedData.file.type,
          fileUrl: blob.url,
          isPublic: validatedData.isPublic,
          userId: session.user.id,
          tags: {
            connect: tagConnections.map(tag => ({ id: tag.id })),
          },
        },
        include: {
          tags: true,
        },
      });
    });

    // Clear relevant caches
    db.clearCache(`user-${session.user.id}-recent`);
    db.clearLoader('dataset');

    // Clear any cached dataset lists
    const cacheKeys = await db.cache.keys();
    cacheKeys
      .filter(key => key.startsWith('recent-datasets-') || key.startsWith('datasets-list-'))
      .forEach(key => db.clearCache(key));

    return NextResponse.json({ success: true, dataset });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    console.error('Error creating dataset:', error);
    return NextResponse.json({ error: 'Failed to create dataset' }, { status: 500 });
  }
}
