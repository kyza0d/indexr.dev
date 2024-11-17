'use client';

import React, { useState, useEffect } from 'react';
import { DatasetList } from './(datasets)/user';
import { fetchUserDatasets } from '@/actions/dataset';
import { Loader2, Search, Upload } from 'lucide-react';
import { Dataset } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadDatasetDialog } from '@/actions/upload/upload-dialog';
import DatasetSkeleton from '@/components/dataset/components/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false); // State for the upload dialog

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      const { datasets: fetchedDatasets, error } = await fetchUserDatasets();
      if (error) {
        setError(error);
      } else {
        setDatasets(fetchedDatasets);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, []);

  const handleDatasetDeleted = () => {
    loadDatasets();
  };

  const handleUploadSuccess = () => {
    setUploadDialogOpen(false);
    loadDatasets(); // Refresh the dataset list upon successful upload
  };

  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    // Render a loading state while datasets are being fetched
    return (
      <div className='container mx-auto h-[97vh]'>
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            {/* Search Icon */}
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-foreground/70" />
            <Input className="w-full max-w-md" placeholder="Search datasets..." />
          </div>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Upload Dataset
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <DatasetSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <Button onClick={loadDatasets}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-[97vh]">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-foreground/70" />
          <Input
            type="text"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md pl-10"
          />
        </div>
        <Button onClick={() => setUploadDialogOpen(true)} variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Upload Dataset
        </Button>
      </div>

      <DatasetList datasets={filteredDatasets} onDatasetDeleted={handleDatasetDeleted} />

      {/* Upload Dataset Dialog */}
      <UploadDatasetDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
