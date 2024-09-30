'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SaveDatasetButtonProps {
  datasetId: string
  isSaved: boolean
  onSaveToggle: (isSaved: boolean) => Promise<void>
}

export function SaveDatasetButton({ datasetId, isSaved, onSaveToggle }: SaveDatasetButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSaveToggle = async () => {
    setIsLoading(true)
    try {
      await onSaveToggle(!isSaved)
      toast({
        title: isSaved ? 'Dataset unsaved' : 'Dataset saved',
        description: isSaved ? 'The dataset has been removed from your saved list.' : 'The dataset has been added to your saved list.',
      })
    } catch (error) {
      console.error('Error toggling dataset save:', error)
      toast({
        title: 'Error',
        description: 'Failed to save/unsave dataset. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSaveToggle}
      disabled={isLoading}
      variant="outline"
    >
      {isSaved ? (
        <BookmarkCheck className="mr-2 h-4 w-4" />
      ) : (
        <Bookmark className="mr-2 h-4 w-4" />
      )}
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  )
}
