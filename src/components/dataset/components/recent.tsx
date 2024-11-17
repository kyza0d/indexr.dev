'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle, FileJson2, FileSpreadsheet } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

interface Dataset {
  id: string
  name: string
  fileType: string
  updatedAt: string
  isPublic: boolean
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error('Failed to fetch')
    }
    return res.json()
  })

export function RecentDatasets() {
  const router = useRouter()
  const { toast } = useToast()
  const { status } = useSession()

  const { data: datasets, error } = useSWR(
    status === 'authenticated' ? '/api/datasets/recent?limit=5' : null,
    fetcher
  )

  const handleDatasetClick = React.useCallback(
    (id: string) => {
      router.push(`/explore/${id}`)
    },
    [router]
  )

  if (status === 'unauthenticated') {
    return null
  }

  if (error) {
    toast({ description: 'Error fetching recent datasets', variant: 'destructive' })
    return (
      <div className="text-red-600 flex items-center">
        <AlertCircle className="mr-2 h-5 w-5" />
        {error.message}
      </div>
    )
  }

  if (!datasets) {
    return (
      <div className='space-y-8 pt-2'>
        {[...Array(5)].map((_, i) => (
          <div className='flex space-x-2' key={i}>
            <Skeleton className="h-10 w-10 rounded" />
            <div className='space-y-2'>
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (datasets.length === 0) {
    return <p className="text-gray-500">No recent datasets found</p>
  }

  return (
    <div className='space-y-3'>
      {datasets.map((dataset: Dataset) => (
        <DatasetItem key={dataset.id} dataset={dataset} onClick={handleDatasetClick} />
      ))}
    </div>
  )
}

interface DatasetItemProps {
  dataset: Dataset
  onClick: (id: string) => void
}

const DatasetItem: React.FC<DatasetItemProps> = ({ dataset, onClick }) => {
  const formattedDate = React.useMemo(
    () => formatDistanceToNow(new Date(dataset.updatedAt), { addSuffix: true }),
    [dataset.updatedAt]
  )

  return (
    <Button
      className="flex px-2 py-7 w-full justify-start text-start rounded shadow-sm cursor-pointer hover:bg-border/40"
      variant="ghost"
      onClick={() => onClick(dataset.id)}
    >
      <div className="mr-3">
        {dataset.fileType === 'text/csv' ? <FileSpreadsheet className="h-6 w-6" /> : <FileJson2 className="h-6 w-6" />}
      </div>

      <div>
        <h3 className="text-sm font-medium">{dataset.name}</h3>
        <p className="text-xs text-primary-foreground/60">{formattedDate}</p>
      </div>
    </Button>
  )
}
