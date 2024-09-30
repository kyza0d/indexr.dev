import { useState, useEffect, useMemo, useCallback } from 'react';
import { IndexItem, TreeNode, GridItem, Dataset, ExampleDataset } from '@/types';
import { buildTreeData, buildGridData, countTotalItems } from '@/lib/data-processing';
import { createSearchFunction } from '@/lib/search';

export function useDataExplorer(initialDataset: Dataset | ExampleDataset) {
  const [dataset, setDataset] = useState<Dataset | ExampleDataset>(initialDataset);
  const [data, setData] = useState<IndexItem[]>([]);
  const [rawData, setRawData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let normalizedData: IndexItem[];
      let rawDataContent: string;

      if ('getData' in dataset) {
        normalizedData = await dataset.getData();
        rawDataContent = JSON.stringify(normalizedData, null, 2);
      } else {
        const [normalizedResponse, rawResponse] = await Promise.all([
          fetch(`/api/datasets/${dataset.id}/data`),
          fetch(`/api/datasets/${dataset.id}/data?raw=true`)
        ]);

        if (!normalizedResponse.ok || !rawResponse.ok) {
          const errorData = await normalizedResponse.json();
          throw new Error(errorData.error || 'Failed to fetch data');
        }

        normalizedData = await normalizedResponse.json();
        rawDataContent = await rawResponse.text();
      }

      setData(normalizedData);
      setRawData(rawDataContent);
      setTotalItems(countTotalItems(normalizedData));
    } catch (err) {
      console.error('Error fetching data:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [dataset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const treeData = useMemo(() => buildTreeData(data), [data]);
  const gridData = useMemo(() => buildGridData(data), [data]);

  const searchFunction = useMemo(() => createSearchFunction(data), [data]);

  const searchResults = useMemo(() => {
    const results = searchFunction(searchTerm);
    return results.map((result, index) => {
      const originalIndex = result.path[1] ? parseInt(result.path[1].replace(/[^\d]/g, ''), 10) : undefined;
      console.log('Search result:', { result, originalIndex, path: result.path });
      return {
        ...result,
        originalIndex,
      };
    });
  }, [searchFunction, searchTerm]);

  const updateSavedStatus = useCallback((isSaved: boolean) => {
    setDataset(prevDataset => {
      if ('isSaved' in prevDataset) {
        return { ...prevDataset, isSaved };
      }
      return prevDataset;
    });
  }, []);

  const refetchDataset = useCallback(async (datasetId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/datasets/${datasetId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch updated dataset')
      }
      const updatedDataset = await response.json()
      setDataset(updatedDataset)
      await fetchData(updatedDataset)
    } catch (err) {
      console.error('Error refetching dataset:', err)
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [fetchData])

  return {
    isLoading,
    error,
    dataset,
    treeData,
    gridData,
    searchTerm,
    setSearchTerm,
    searchResults,
    rawData,
    totalItems,
    updateSavedStatus,
    refetchDataset,
  };
}
