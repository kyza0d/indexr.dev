import React, { useCallback, useState, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RawDataModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string;
}

export function RawDataModal({ isOpen, onOpenChange, datasetId }: RawDataModalProps) {
  const [rawData, setRawData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/datasets/${datasetId}/raw-data?page=${page}`
      );
      const data = await response.json();

      if (data.data) {
        setRawData(prev => [...prev, ...data.data]);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching raw data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load raw data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [datasetId, page, toast]);

  useEffect(() => {
    if (isOpen && page === 1) {
      fetchData();
    }
  }, [isOpen, page, fetchData]);

  const handleEndReached = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}/raw-data?raw=true`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dataset-${datasetId}-raw.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to download raw data',
        variant: 'destructive',
      });
    }
  }, [datasetId, toast]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(rawData.join('\n'));
      toast({
        title: 'Success',
        description: 'Raw data copied to clipboard',
      });
    } catch (error) {
      console.error('Error copying data:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy raw data',
        variant: 'destructive',
      });
    }
  }, [rawData, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Raw Data</DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCopy}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden font-mono text-sm">
          <Virtuoso
            style={{ height: 'calc(80vh - 120px)' }}
            data={rawData}
            endReached={handleEndReached}
            overscan={200}
            itemContent={(_, line) => (
              <div
                className={cn('px-4 py-1 whitespace-pre',)}
              >
                {line}
              </div>
            )}
            components={{
              Footer: () =>
                isLoading ? (
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : null,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
