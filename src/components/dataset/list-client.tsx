'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Pagination } from '@/components/ui/pagination'
import { DatasetCard } from '@/components/dataset/dataset-card'
import { Filters } from '@/components/dataset/filters'
import { useDatasetSearch } from './dataset-search-context'
import { useSession } from 'next-auth/react'
import { DatasetListSkeleton } from './list-skeleton'

export function DatasetListClient({ minimal }: { minimal?: boolean }) {
  const router = useRouter()
  const { query, tags, datasets, filteredDatasets, setDatasets } = useDatasetSearch()
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()
  const pageSize = 12

  useEffect(() => {
    const fetchDatasets = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/datasets/search')
        if (!response.ok) {
          throw new Error('Failed to fetch datasets')
        }
        const data = await response.json()
        setDatasets(data.datasets)
      } catch (error) {
        console.error('Error fetching datasets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDatasets()
  }, [setDatasets])

  useEffect(() => {
    setPage(1)
  }, [query, tags])

  const paginatedDatasets = filteredDatasets.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filteredDatasets.length / pageSize)

  return (
    <ScrollArea className="h-[96vh]">
      <div className="mx-auto py-8">
        <Filters />

        {isLoading ? (
          <DatasetListSkeleton />
        ) : paginatedDatasets.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No datasets found. Upload your first dataset to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedDatasets.map((dataset) => {
              const isOwner = session?.user?.id === dataset.userId
              return (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  isOwner={isOwner}
                  savingId={null}
                  deletingId={null}
                  minimal={minimal}
                />
              )
            })}
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
