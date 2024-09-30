import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
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
  if (!session || !session.user || !session.user.id) {
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

    const dataset = await prisma.dataset.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        fileType: validatedData.file.type,
        fileUrl: blob.url,
        isPublic: validatedData.isPublic,
        userId: session.user.id, // This is now guaranteed to be defined
        tags: {
          connectOrCreate: validatedData.tags.map(tag => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json({ success: true, dataset });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', errors: error.errors }, { status: 400 });
    }
    console.error('Error creating dataset:', error);
    return NextResponse.json({ error: 'Failed to create dataset' }, { status: 500 });
  }
}
