import { fetchDatasets } from '@/actions/dataset'
import { DatasetListClient } from '@/components/dataset/list-client'

export async function DatasetList({ minimal }: { minimal?: boolean }) {
  const { error } = await fetchDatasets()

  if (error) {
    console.error('Error fetching datasets:', error)
    return <div>Error loading datasets. Please try again later.</div>
  }

  return (
    <DatasetListClient minimal={minimal} />
  )
}
