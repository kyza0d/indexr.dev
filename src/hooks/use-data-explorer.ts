import { useState, useEffect, useMemo, useCallback } from 'react';
import { IndexItem, Dataset, ExampleDataset } from '@/types';
import { buildTreeData, buildGridData, countTotalItems } from '@/lib/data-processing';
import { createSearchFunction } from '@/lib/search';
import { normalizeData } from '@/lib/data-processing'; // Client-side normalization

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

      const fetchOptions = { credentials: 'omit' as RequestCredentials };

      const rawResponse = await fetch(`/api/datasets/${dataset.id}/data?raw=true`, fetchOptions);

      if (!rawResponse.ok) {
        let errorMessage = 'Failed to fetch data';

        try {
          const errorData = await rawResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
        }

        throw new Error(errorMessage);
      }

      rawDataContent = await rawResponse.text();
      setRawData(rawDataContent);

      // Perform normalization on the client side
      normalizedData = await normalizeData(rawDataContent, dataset.fileType);
      setData(normalizedData);
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
    return results.map((result) => {
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
  };
}
