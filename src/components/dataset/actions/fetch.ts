import { Dataset, IndexItem } from '@/types'
import { normalize } from '@/data/lib/normalize'

interface FetchDataOptions {
  dataset: Dataset
  onStart?: () => void
  onComplete?: (data: IndexItem[]) => void
  onError?: (error: Error) => void
}

export async function fetchDataset({ dataset, onStart, onComplete, onError }: FetchDataOptions) {
  try {
    onStart?.()
    const response = await fetch(`/api/datasets/${dataset.id}/data?raw=true`)

    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }

    const rawData = await response.text()
    const normalizedData = await normalize(rawData, dataset.fileType)

    onComplete?.(normalizedData)
    return normalizedData
  } catch (err) {
    const error = err instanceof Error ? err : new Error('An error occurred')
    onError?.(error)
    throw error
  }
}
