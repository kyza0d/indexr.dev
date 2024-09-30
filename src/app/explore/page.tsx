import React, { Suspense } from 'react';
import { DatasetList } from '@/components/dataset/list';
import { TagCompletionSearchBar } from '@/components/dataset/tag-completion-search';
import { DatasetSearchProvider } from '@/components/dataset/dataset-search-context';

export const revalidate = 60;

export default function ExplorePage() {
  return (
    <DatasetSearchProvider>
      <div className="mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="w-full">
            <Suspense fallback={<div>Loading search bar...</div>}>
              <TagCompletionSearchBar />
            </Suspense>
          </div>
          <main className="w-full">
            <Suspense fallback={<div>Loading dataset list...</div>}>
              <DatasetList />
            </Suspense>
          </main>
        </div>
      </div>
    </DatasetSearchProvider>
  );
}
