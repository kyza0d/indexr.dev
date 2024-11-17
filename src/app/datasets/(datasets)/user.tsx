import React, { useState } from 'react';
import { deleteDataset, saveDataset } from '@/actions/dataset';
import { useToast } from '@/hooks/use-toast';
import { Dataset } from '@/types';
import { DatasetCard } from '@/dataset/components/card';
import { useSession } from 'next-auth/react';

interface UserDatasetListProps {
  datasets: Dataset[];
  onDatasetDeleted: () => void;
}

export const DatasetList = ({ datasets, onDatasetDeleted }: UserDatasetListProps) => {
  const { toast } = useToast();
  const { data: session } = useSession();

  const [_actionId, setActionId] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'delete' | 'save', isSaved?: boolean) => {
    if (action === 'delete' && !window.confirm("Are you sure you want to delete this dataset?")) return;

    setActionId(id);
    try {
      const result = action === 'delete' ? await deleteDataset(id) : await saveDataset(id, !isSaved);
      if (result.success) {
        toast({
          title: 'Success',
          description: action === 'delete' ? 'Dataset deleted successfully.' : isSaved ? 'Dataset unsaved.' : 'Dataset saved.',
        });
        onDatasetDeleted();
      } else {
        throw new Error(result.error || `Failed to ${action} dataset`);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${action} dataset. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {datasets.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            isOwner={dataset.userId === session?.user?.id}
            onSave={(id, isSaved) => handleAction(id, 'save', isSaved)}
            onDelete={(id) => handleAction(id, 'delete')}
          />
        ))}
      </div>
    </div>
  );
};
