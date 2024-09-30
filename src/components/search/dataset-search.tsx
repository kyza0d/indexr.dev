'use client'

import React, { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchBar } from '@/components/search/search-bar'
import { useDebounce } from '@/hooks/use-debounce'

/**
 * DatasetSearch component allows users to search datasets by query.
 */
export function DatasetSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = React.useState<string>(searchParams.get('q') || '')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  React.useEffect(() => {
    const updatedSearchParams = new URLSearchParams(Array.from(searchParams.entries()))
    if (debouncedSearchTerm) {
      updatedSearchParams.set('q', debouncedSearchTerm)
    } else {
      updatedSearchParams.delete('q')
    }
    const search = updatedSearchParams.toString()
    const query = search ? `?${search}` : ''
    router.push(`/explore${query}`)
  }, [debouncedSearchTerm, router, searchParams])

  /**
   * Handles changes in the search input.
   *
   * @param value - The new search term entered by the user.
   */
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  return (
    <SearchBar
      value={searchTerm}
      onChange={handleSearchChange}
    />
  )
}
