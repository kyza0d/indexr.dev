import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteDataset } from '@/actions/dataset';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = params;

  try {
    const result = await deleteDataset(id);
    if (result.success) {
      return NextResponse.json({ message: 'Dataset deleted successfully' });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return NextResponse.json({ error: 'Failed to delete dataset' }, { status: 500 });
  }
}
