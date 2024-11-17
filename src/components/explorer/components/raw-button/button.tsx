import React from 'react';
import { Button } from '@/components/ui/button';
import { FileJson, FileSpreadsheet } from 'lucide-react';
import { useExplorerContext } from '@/explorer/provider';

interface RawDataButtonProps {
  onClick: () => void;
}

export function RawDataButton({ onClick }: RawDataButtonProps) {
  const { dataset } = useExplorerContext();

  const FileIcon = dataset?.fileType === 'text/csv' ? FileSpreadsheet : FileJson;

  return (
    <Button
      className="flex items-center gap-2"
      variant="outline"
      onClick={onClick}
    >
      <FileIcon className="h-4 w-4" />
      {dataset?.name && (
        <>
          <span className="text-muted-foreground truncate max-w-[200px]">
            {dataset.name}
          </span>
        </>
      )}
    </Button>
  );
}
