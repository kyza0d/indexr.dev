import { useState, useEffect } from 'react'
import { Dataset } from '@/types'

interface UseDatasetResult {
  datasets: Dataset[]
  isLoading: boolean
  error: string | null
  totalPages: number
  totalCount: number
}

export function useDatasets(query: string, tags: string[], page: number): UseDatasetResult {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const fetchDatasets = async () => {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (query) params.set('q', query)
      tags.forEach(tag => params.append('tag', tag))
      params.set('page', page.toString())

      try {
        const response = await fetch(`/api/datasets/search?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch datasets')
        }
        const data = await response.json()
        setDatasets(data.datasets)
        setTotalPages(data.totalPages)
        setTotalCount(data.totalCount)
      } catch (err) {
        setError('Error fetching datasets')
        console.error('Error fetching datasets:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDatasets()
  }, [query, tags, page])

  return { datasets, isLoading, error, totalPages, totalCount }
}
