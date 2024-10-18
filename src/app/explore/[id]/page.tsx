import { Suspense } from 'react'
import { DataExplorer } from '@/components/data/explorer'
import { DataExplorerSkeleton } from '@/components/data/explorer-skeleton'
import { getDatasetById } from '@/lib/datasets'
import { notFound } from 'next/navigation'

interface ExplorePageProps {
  params: { id: string }
}

export default async function ExplorePage({ params }: ExplorePageProps) {
  const { id } = params

  const dataset = await getDatasetById(id)
  if (!dataset) {
    notFound()
  }

  return (
    <div className="mx-auto">
      <Suspense fallback={<DataExplorerSkeleton />}>
        <DataExplorer initialDataset={dataset} />
      </Suspense>
    </div>
  )
}
