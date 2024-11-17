import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bookmark, BookmarkCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SaveDatasetButtonProps {
  dataset: {
    id: string;
    isPublic: boolean;
    userId: string;
    isSaved: boolean;
  };
}

export const SaveDatasetButton = ({ dataset }: SaveDatasetButtonProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [savedState, setSavedState] = useState(dataset.isSaved);

  // Don't show the button if we're the owner or if the dataset isn't public
  if (!dataset.isPublic || dataset.userId === session?.user?.id) {
    return null;
  }

  const handleSaveToggle = async () => {
    if (!session) {
      router.push('/auth/sign-in');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/datasets/save', {
        method: savedState ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasetId: dataset.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to save dataset');
      }

      // Update local state immediately
      setSavedState(!savedState);

      toast({
        title: savedState ? 'Dataset unsaved' : 'Dataset saved',
        description: savedState
          ? 'Dataset removed from your saved items'
          : 'Dataset added to your saved items',
      });

      // Trigger a revalidation of the data
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save dataset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Causes accidental return
  // React.useEffect(() => {
  //   setSavedState(dataset.isSaved);
  // }, [dataset.isSaved]);

  return (
    <Button
      variant="outline"
      onClick={handleSaveToggle}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : savedState ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {savedState ? 'Saved' : 'Save'}
    </Button>
  );
}
