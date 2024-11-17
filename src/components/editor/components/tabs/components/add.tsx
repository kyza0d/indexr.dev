import React from 'react';
import { Plus } from 'lucide-react';
import { useTabs } from '@/tabs/provider';
import { Button } from '@/components/ui/button';
import { FileType } from '@/editor/provider';

const DEFAULT_JSON = `{
  "data": {}
}`;

export function AddDataset() {
  const { addTab } = useTabs();

  const handleCreate = () => {
    addTab('Untitled', DEFAULT_JSON, FileType.JSON);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10"
      onClick={handleCreate}
    >
      <Plus className="h-4 w-4" />
    </Button>
  );
}
