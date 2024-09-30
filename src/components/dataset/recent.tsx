'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Globe, Lock, Loader2, AlertCircle, FileJson2, FileSpreadsheet } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

/**
 * Type definition for a dataset.
 */
interface Dataset {
  id: string
  name: string
  fileType: string
  updatedAt: string
  isPublic: boolean
}

/**
 * Fetcher function for SWR.
 */
const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error('Failed to fetch')
    }
    return res.json()
  })

/**
 * RecentDatasets component displays a list of recently accessed datasets.
 * Utilizes SWR for data fetching and caching.
 */
export function RecentDatasets() {
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()

  const { data: datasets, error } = useSWR<Dataset[]>(
    status === 'authenticated' ? '/api/datasets/recent?limit=5' : null,
    fetcher
  )

  const handleDatasetClick = React.useCallback(
    (id: string) => {
      router.push(`/explore/${id}`)
    },
    [router]
  )

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[300px]" role="status" aria-label="Loading">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="text-sm text-muted-foreground p-2">
        Please log in to view recent datasets
      </div>
    )
  }

  if (error) {
    toast({ description: 'Error fetching recent datasets', variant: 'destructive' })
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" aria-hidden="true" />
        <p className="text-sm text-center">{error.message}</p>
      </div>
    )
  }

  if (!datasets) {
    return (
      <div className="flex items-center justify-center h-[300px]" role="status" aria-label="Loading">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (datasets.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2">No recent datasets found</div>
    )
  }

  return (
    <>
      <Separator className="mb-4" orientation="horizontal" />
      <div className="space-y-2">
        {datasets.map((dataset) => (
          <DatasetItem key={dataset.id} dataset={dataset} onClick={handleDatasetClick} />
        ))}
      </div>
    </>
  )
}

/**
 * Props for the DatasetItem component.
 */
interface DatasetItemProps {
  dataset: Dataset
  onClick: (id: string) => void
}

/**
 * DatasetItem component represents a single dataset item in the list.
 */
const DatasetItem: React.FC<DatasetItemProps> = ({ dataset, onClick }) => {
  const formattedDate = React.useMemo(
    () => formatDistanceToNow(new Date(dataset.updatedAt), { addSuffix: true }),
    [dataset.updatedAt]
  )

  return (
    <Button
      variant="ghost"
      className="w-full justify-start font-normal h-auto py-2"
      onClick={() => onClick(dataset.id)}
    >
      <div className="-ml-1">
        {dataset.fileType === 'text/csv' ? (
          <FileSpreadsheet className="h-5 w-5 mr-3" aria-hidden="true" />
        ) : (
          <FileJson2 className="h-5 w-5 mr-3" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm font-medium truncate max-w-[150px]">{dataset.name}</span>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>
      </div>
      <div className="ml-auto">
        {dataset.isPublic ? (
          <Globe className="h-4 w-4 text-green-500" aria-label="Public dataset" />
        ) : (
          <Lock className="h-4 w-4 text-yellow-500" aria-label="Private dataset" />
        )}
      </div>
    </Button>
  )
}
