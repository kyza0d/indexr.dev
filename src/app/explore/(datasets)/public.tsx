'use client'

import React, { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Pagination } from '@/components/ui/pagination'
import { DatasetCard } from '@/dataset/components/card'
import DatasetSkeleton from '@/dataset/components/skeleton'
import { DatasetTagFilters } from '@/search/components/tags/tag-filters'
import { useDatasetSearch } from '@/dataset/provider'
import { useSession } from 'next-auth/react'
import { fetchDatasets } from '@/actions/dataset'


export function PublicDatasets() {
  const { query, tags, filteredDatasets, setDatasets } = useDatasetSearch();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const pageSize = 12;

  useEffect(() => {
    const loadDatasets = async () => {
      setLoading(true);
      try {
        const serverResult = await fetchDatasets();
        if (serverResult.error) {
          const response = await fetch('/api/datasets/search');
          if (!response.ok) {
            throw new Error('Failed to fetch datasets');
          }
          const data = await response.json();
          setDatasets(data.datasets);
        } else {
          setDatasets(serverResult.datasets);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching datasets:', err);
        setError('Error loading datasets. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadDatasets();
  }, [setDatasets]);

  useEffect(() => {
    setPage(1);
  }, [query, tags]);

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const paginatedDatasets = filteredDatasets.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredDatasets.length / pageSize);

  if (loading) {
    return (
      <ScrollArea>
        <div className="grid grid-cols-2 gap-4">
          <DatasetSkeleton />
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea>
      <DatasetTagFilters />
      {filteredDatasets.length === 0 ? (
        <div className="text-center text-gray-500">
          No datasets found. Upload your first dataset to get started!
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          {paginatedDatasets.map((dataset) => {
            const isOwner = session?.user?.id === dataset.userId;
            return (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isOwner={isOwner}
              />
            );
          })}
        </div>
      )}
      <div>
        <Pagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>
    </ScrollArea>
  );
}
