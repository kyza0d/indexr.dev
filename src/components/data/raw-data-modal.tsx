import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Copy, Check } from 'lucide-react';
import { Virtuoso } from 'react-virtuoso';

interface RawDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId: string;
  datasetName: string | undefined;
  datasetDescription: string | undefined;
  fileType: string | undefined;
}

interface DataSummary {
  totalRows: number;
  fileSize: string;
}

export const RawDataModal: React.FC<RawDataModalProps> = ({ isOpen, onClose, datasetId, datasetName, datasetDescription, fileType }) => {
  const [data, setData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [summary, setSummary] = useState<DataSummary | null>(null);

  const fetchData = useCallback(async (page: number) => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}/raw-data?page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(prevData => (page === 1 ? result.data : [...prevData, ...result.data]));
      setHasMore(result.hasMore);
      if (page === 1) {
        setSummary(result.summary);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setData([]);
      setCurrentPage(1);
      fetchData(1);
    }
  }, [isOpen, fetchData]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setCurrentPage(prevPage => prevPage + 1);
      fetchData(currentPage + 1);
    }
  }, [hasMore, isLoading, currentPage, fetchData]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.join('\n'));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([data.join('\n')], { type: fileType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${datasetName?.replace(/\s+/g, '_')}_raw_data${fileType === 'application/json' ? '.json' : '.csv'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{datasetName} - Raw Data</DialogTitle>
        </DialogHeader>
        <div className="flex justify-between items-center">
          {summary && (
            <div>
              <div className="space-x-4 mb-4 flex">
                {fileType === 'text/csv' && <p>Total Rows: {summary.totalRows}</p>}
                <p>File Size: {summary.fileSize}</p>
              </div>
              {datasetDescription && <p className="text-muted-foreground max-w-[56ch]">{datasetDescription}</p>}
            </div>
          )}
          <div className="flex space-x-2 mb-4">
            <Button onClick={handleCopy} disabled={isCopied || data.length === 0}>
              {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
            <Button onClick={handleDownload} disabled={data.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        <div className="h-[calc(80vh-12rem)]">
          {isLoading && data.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <Virtuoso
              style={{ height: '100%' }}
              data={data}
              endReached={handleLoadMore}
              itemContent={(index, item) => (
                <div key={index} className="py-1 border-b last:border-b-0">
                  {item}
                </div>
              )}
              components={{
                Footer: () =>
                  hasMore ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : null,
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
