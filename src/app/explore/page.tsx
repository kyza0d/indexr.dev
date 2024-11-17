import { Suspense } from 'react';
import { PublicDatasets } from './(datasets)/public';
import { TagCompletion } from '@/components/search/components/tags/tag-completion';
import { DatasetSearchProvider } from '@/dataset/provider';

export const revalidate = 60;

export default function ExplorePage() {

  return (
    <DatasetSearchProvider>
      <main className="h-[97vh]">
        <Suspense fallback={<div>Loading...</div>}>
          <div className="container mx-auto w-full">
            <TagCompletion />
            <PublicDatasets />
          </div>
        </Suspense>
      </main>
    </DatasetSearchProvider>
  );
}
