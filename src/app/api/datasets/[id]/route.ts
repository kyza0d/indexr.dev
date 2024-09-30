import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { deleteDataset } from '@/actions/dataset';

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  console.log('Entering DELETE function for dataset');
  try {
    const session = await auth();
    console.log('Auth session:', session ? 'exists' : 'does not exist');

    if (!session) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = params;
    console.log('Dataset ID to delete:', id);

    console.log('Attempting to delete dataset');
    const result = await deleteDataset(id);

    if (result.success) {
      console.log('Dataset deleted successfully');
      return NextResponse.json({ message: 'Dataset deleted successfully' });
    } else {
      console.error('Failed to delete dataset:', result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in dataset deletion route:', error);
    return NextResponse.json({
      error: 'Failed to delete dataset',
      details: (error as Error).message
    }, { status: 500 });
  }
}
