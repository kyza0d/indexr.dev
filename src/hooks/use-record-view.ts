import { useEffect } from 'react'
import { toast } from '@/hooks/use-toast'

/**
 * Custom hook to record a view for a dataset
 * @param datasetId - The ID of the dataset being viewed
 * @param status - The authentication status of the user
 */
export function useRecordView(datasetId: string | undefined, status: string) {
  useEffect(() => {
    const recordView = async () => {
      if (status === 'authenticated' && datasetId) {
        try {
          const response = await fetch(`/api/datasets/${datasetId}/view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const result = await response.json()
          console.log('View recorded successfully:', result)
        } catch (error) {
          console.error('Failed to record dataset view:', error)
          toast({
            title: 'Error',
            description: "Failed to record dataset view. This won't affect your ability to view the data.",
            variant: 'destructive',
          })
        }
      }
    }

    recordView()
  }, [datasetId, status])
}
