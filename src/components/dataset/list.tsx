import { fetchDatasets, deleteDataset, saveDataset } from '@/actions/dataset'
import { DatasetListClient } from '@/components/dataset/list-client'
import { auth } from '@/auth'

export async function DatasetList() {
  const { datasets, error, totalPages } = await fetchDatasets()
  const session = await auth()

  if (error) {
    console.error('Error fetching datasets:', error)
    return <div>Error loading datasets. Please try again later.</div>
  }

  return (
    <DatasetListClient
      initialDatasets={datasets}
      initialTotalPages={totalPages}
      deleteDataset={deleteDataset}
      saveDataset={saveDataset}
      currentUserId={session?.user?.id}
    />
  )
}
