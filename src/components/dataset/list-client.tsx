'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Pagination } from '@/components/ui/pagination'
import { DatasetCard } from '@/components/dataset/dataset-card'
import { Filters } from '@/components/dataset/filters'
import { useDatasetSearch } from './dataset-search-context'
import { useDatasets } from '@/hooks/use-datasets'

export function DatasetListClient() {
  const router = useRouter()
  const { query, tags } = useDatasetSearch()
  const [page, setPage] = useState(1)
  const { datasets, isLoading, error, totalPages, totalCount } = useDatasets(query, tags, page)

  useEffect(() => {
    setPage(1)
  }, [query, tags])

  const handleView = useCallback((id: string) => {
    router.push(`/explore/${id}`)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Error loading datasets. Please try again later.
      </div>
    )
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Datasets</h1>

        <Filters totalCount={totalCount} />

        {datasets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No datasets found. Upload your first dataset to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {datasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                onView={handleView}
              />
            ))}
          </div>
        )}
        <div className="mt-8">
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      </div>
    </ScrollArea>
  )
}
