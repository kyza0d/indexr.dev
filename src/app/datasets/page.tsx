'use client';

import React, { useState, useEffect } from 'react';
import { UserDatasetList } from '@/components/dataset/user-list';
import { fetchDatasets } from '@/actions/dataset';
import { Loader2 } from 'lucide-react';
import { Dataset } from '@/types';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      const { datasets: fetchedDatasets, error } = await fetchDatasets();
      if (error) {
        throw new Error(error);
      }
      // Transform fetchedDatasets to match Dataset type
      const transformedDatasets: Dataset[] = fetchedDatasets.map(dataset => ({
        ...dataset,
        isSaved: false, // Set a default value or implement logic to determine if saved
        createdAt: dataset.createdAt.toISOString(),
        updatedAt: dataset.updatedAt.toISOString(),
      }));
      setDatasets(transformedDatasets);
    } catch (error) {
      console.error('Error fetching datasets:', error);
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

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <UserDatasetList datasets={datasets} onDatasetDeleted={handleDatasetDeleted} />
      )}
    </div>
  );
}
