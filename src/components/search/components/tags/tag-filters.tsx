'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useDatasetSearch } from '@/dataset/provider'

export const DatasetTagFilters: React.FC = () => {
  const { query, tags, totalCount, removeTag, clearFilters, setQuery } = useDatasetSearch()

  if (!query && tags.length === 0) {
    return null
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">Matching datasets: {totalCount}</p>
        <Button variant="outline" onClick={clearFilters}>
          Clear all filters
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {query && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Search: {query}
            <X className="h-4 w-4 cursor-pointer" onClick={() => setQuery('')} />
          </Badge>
        )}
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
            Tag: {tag}
            <X className="h-4 w-4 cursor-pointer" onClick={() => removeTag(tag)} />
          </Badge>
        ))}
      </div>
    </>
  )
}
