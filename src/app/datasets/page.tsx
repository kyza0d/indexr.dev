'use client';

import React, { useState, useEffect } from 'react';
import { UserDatasetList } from '@/components/dataset/user-list';
import { fetchUserDatasets } from '@/actions/dataset';
import { Loader2 } from 'lucide-react';
import { Dataset } from '@/types';

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <UserDatasetList datasets={datasets} onDatasetDeleted={handleDatasetDeleted} />
    </div>
  );
}
