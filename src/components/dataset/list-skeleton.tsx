import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

const DatasetCardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-4">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <div className="flex space-x-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
)

export const DatasetListSkeleton = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, index) => (
          <DatasetCardSkeleton key={index} />
        ))}
      </div>

      <div className="flex justify-center space-x-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  )
}
