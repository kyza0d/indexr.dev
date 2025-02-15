import { Suspense } from 'react';
import { getDatasetById } from '@/lib/datasets';

import { Explorer } from '@/components/explorer';
import { ExplorerProvider } from '@/explorer/provider';

interface ExplorePageProps {
  params: Promise<{ id: string }>;
}

export default async function Explore(props: ExplorePageProps) {
  const params = await props.params;
  const dataset = await getDatasetById(params.id);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExplorerProvider dataset_id={dataset}>
        <Explorer />
      </ExplorerProvider>
    </Suspense>
  );
}
