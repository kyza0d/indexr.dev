'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { SearchBar } from '@/components/search/search-bar'
import { Loader2 } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
import { DatasetCard } from '../dataset/dataset-card'
import { useRouter } from 'next/navigation'

interface Dataset {
  id: string
  name: string
  description: string
  updatedAt: string
  isPublic: boolean
  tags: { name: string }[]
  userId: string
  isSaved: boolean
  fileType: string
  createdAt: string
}

export default function Dashboard() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const router = useRouter()

  const fetchDatasets = useCallback(
    async (page: number, query: string) => {
      if (status !== 'authenticated') return

      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/datasets/search?q=${encodeURIComponent(query)}&page=${page}&limit=6`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch datasets')
        }
        const data = await response.json()
        setDatasets(data.datasets)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error('Error fetching datasets:', error)
        toast({
          title: 'Error',
          description: 'Failed to fetch datasets. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [status, toast]
  )

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDatasets(currentPage, searchQuery)
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, status, fetchDatasets])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleView = useCallback(
    (id: string) => {
      router.push(`/explore/${id}`)
    },
    [router]
  )

  const handleSave = useCallback(
    async (id: string, isSaved: boolean) => {
      setSavingId(id)
      try {
        const response = await fetch('/api/datasets/save', {
          method: isSaved ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datasetId: id }),
        })

        if (!response.ok) {
          throw new Error('Failed to update saved status')
        }

        toast({
          title: 'Success',
          description: isSaved
            ? 'Dataset unsaved successfully.'
            : 'Dataset saved successfully.',
        })
        fetchDatasets(currentPage, searchQuery) // Refresh the list
      } catch (error) {
        console.error('Error updating saved status:', error)
        toast({
          title: 'Error',
          description: 'Failed to update saved status. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setSavingId(null)
      }
    },
    [currentPage, searchQuery, toast, fetchDatasets]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id)
      try {
        const response = await fetch(`/api/datasets/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete dataset')
        }

        toast({
          title: 'Success',
          description: 'Dataset deleted successfully.',
        })
        fetchDatasets(currentPage, searchQuery) // Refresh the list
      } catch (error) {
        console.error('Error deleting dataset:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete dataset. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setDeletingId(null)
      }
    },
    [currentPage, searchQuery, toast, fetchDatasets]
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <SearchBar value={searchQuery} onChange={handleSearch} />
      {datasets.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">No datasets found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {datasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isOwner={dataset.userId === session?.user?.id}
                onView={handleView}
                onSave={handleSave}
                onDelete={handleDelete}
                savingId={savingId}
                deletingId={deletingId}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  )
}
