'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  Suspense,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Dataset } from '@/types'

interface DatasetSearchContextType {
  query: string
  tags: string[]
  datasets: Dataset[]
  filteredDatasets: Dataset[]
  totalCount: number
  setQuery: (query: string) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  clearFilters: () => void
  setDatasets: (datasets: Dataset[]) => void
}

const DatasetSearchContext = createContext<
  DatasetSearchContextType | undefined
>(undefined)

export const useDatasetSearch = () => {
  const context = useContext(DatasetSearchContext)
  if (!context) {
    throw new Error(
      'useDatasetSearch must be used within a DatasetSearchProvider'
    )
  }
  return context
}

function DatasetSearchProviderContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [tags, setTags] = useState<string[]>(searchParams.getAll('tag'))
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([])

  const addTag = useCallback((tag: string) => {
    setTags((prevTags) => {
      if (!prevTags.includes(tag)) {
        return [...prevTags, tag]
      }
      return prevTags
    })
  }, [])

  const removeTag = useCallback((tag: string) => {
    setTags((prevTags) => prevTags.filter((t) => t !== tag))
  }, [])

  const clearFilters = useCallback(() => {
    setQuery('')
    setTags([])
  }, [])

  useEffect(() => {
    const filtered = datasets.filter((dataset) => {
      const matchesQuery =
        dataset.name.toLowerCase().includes(query.toLowerCase()) ||
        (dataset.description ?? '')
          .toLowerCase()
          .includes(query.toLowerCase())
      const matchesTags =
        tags.length === 0 ||
        tags.every((tag) =>
          dataset.tags.some(
            (t) => t.name.toLowerCase() === tag.toLowerCase()
          )
        )
      return matchesQuery && matchesTags
    })
    setFilteredDatasets(filtered)

    const params = new URLSearchParams()
    if (query) params.set('q', query)
    tags.forEach((tag) => params.append('tag', tag))
    router.push(`/explore?${params.toString()}`)
  }, [query, tags, datasets, router])

  const value = {
    query,
    tags,
    datasets,
    filteredDatasets,
    totalCount: filteredDatasets.length,
    setQuery,
    addTag,
    removeTag,
    clearFilters,
    setDatasets,
  }

  return (
    <DatasetSearchContext.Provider value={value}>
      {children}
    </DatasetSearchContext.Provider>
  )
}

export const DatasetSearchProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <Suspense fallback={<div>Loading search context...</div>}>
      <DatasetSearchProviderContent>{children}</DatasetSearchProviderContent>
    </Suspense>
  )
}
