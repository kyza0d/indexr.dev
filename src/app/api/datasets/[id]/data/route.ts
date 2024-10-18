import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeData } from '@/lib/data-processing';

// Helper function to get the current timestamp
function getCurrentTimestamp() {
  return new Date().toISOString();
}

// Helper function to log debug messages with timestamps
function logDebug(message: string) {
  console.log(`[${getCurrentTimestamp()}] DEBUG: ${message}`);
}

// Helper function to log error messages with timestamps
function logError(message: string) {
  console.error(`[${getCurrentTimestamp()}] ERROR: ${message}`);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  logDebug('Entering GET function for dataset data');
  const startTime = Date.now(); // Start time for total execution

  try {
    const { id } = params;
    logDebug(`Dataset ID: ${id}`);

    const { searchParams } = new URL(req.url);
    const raw = searchParams.get('raw') === 'true';
    logDebug(`Raw data requested: ${raw}`);

    logDebug('Fetching dataset from database');
    const dbStartTime = Date.now(); // Start time for DB fetch
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        fileUrl: true,
        fileType: true,
        isPublic: true,
        userId: true,
      },
    });
    logDebug(`Database fetch duration: ${Date.now() - dbStartTime}ms`);

    if (!dataset) {
      logDebug('Dataset not found');
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    logDebug(`Dataset found: ${dataset.name}`);

    // Check if the dataset is public
    if (!dataset.isPublic) {
      // Dataset is not public; deny access
      logDebug('Unauthorized access attempt to a private dataset');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!dataset.fileUrl) {
      logDebug('Dataset file URL is missing');
      return NextResponse.json({ error: 'Dataset file URL is missing' }, { status: 500 });
    }

    logDebug(`Fetching file content from URL: ${dataset.fileUrl}`);
    const fileFetchStartTime = Date.now(); // Start time for file fetch
    const response = await fetch(dataset.fileUrl);
    logDebug(`File fetch duration: ${Date.now() - fileFetchStartTime}ms`);

    if (!response.ok) {
      logError(`Failed to fetch file: ${response.statusText}. URL: ${dataset.fileUrl}`);
      return NextResponse.json(
        { error: `Failed to fetch file: ${response.statusText}` },
        { status: response.status }
      );
    }
    logDebug('File content fetched successfully');

    if (raw) {
      logDebug('Returning raw file content');
      // Stream the response body directly to the client
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': dataset.fileType,
          // You can copy other headers if necessary
        },
      });
    } else {
      logDebug('Reading file content for normalization');
      const fileContent = await response.text();
      logDebug('File content read successfully');

      logDebug('Normalizing data');
      const normalizeStartTime = Date.now(); // Start time for normalization
      const normalizedData = await normalizeData(fileContent, dataset.fileType);
      logDebug(`Data normalization duration: ${Date.now() - normalizeStartTime}ms`);

      logDebug('Data normalized successfully');
      return NextResponse.json(normalizedData);
    }
  } catch (error) {
    logError(`Error in dataset data route: ${error}`);
    return NextResponse.json(
      { error: 'Error fetching dataset: ' + (error as Error).message },
      { status: 500 }
    );
  } finally {
    logDebug(`Total execution time: ${Date.now() - startTime}ms`);
  }
}
