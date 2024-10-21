import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { deleteDataset, saveDataset } from '@/actions/dataset';
import { useToast } from '@/hooks/use-toast';
import { Dataset } from '@/types';
import { DatasetCard } from './dataset-card';
import { useSession } from 'next-auth/react';

interface UserDatasetListProps {
  datasets: Dataset[];
  onDatasetDeleted: () => void;
}

export const UserDatasetList = ({ datasets, onDatasetDeleted }: UserDatasetListProps) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteDataset(id);
      if (result.success) {
        onDatasetDeleted();
        toast({
          title: 'Success',
          description: 'Dataset deleted successfully.',
        });
      } else {
        throw new Error(result.error || 'Failed to delete dataset');
      }
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete dataset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (id: string, isSaved: boolean) => {
    setSavingId(id);
    try {
      const result = await saveDataset(id, !isSaved);
      if (result.success) {
        toast({
          title: 'Success',
          description: isSaved ? 'Dataset unsaved successfully.' : 'Dataset saved successfully.',
        });
        onDatasetDeleted(); // Refresh the list after saving/unsaving
      } else {
        throw new Error(result.error || 'Failed to save dataset');
      }
    } catch (error) {
      console.error('Error saving dataset:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save dataset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingId(null);
    }
  };

  if (datasets.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No datasets found. Create your first dataset to get started!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 container mx-auto">
      {datasets.map((dataset) => (
        <DatasetCard
          key={dataset.id}
          dataset={dataset}
          isOwner={dataset.userId === session?.user?.id}
          onSave={handleSave}
          onDelete={handleDelete}
          savingId={savingId}
          deletingId={deletingId}
        />
      ))}
    </div>
  );
}
