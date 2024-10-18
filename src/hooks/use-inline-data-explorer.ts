import { useState, useMemo, useCallback } from 'react';
import { IndexItem, FileType } from '@/types';
import { normalizeData, buildTreeData, buildGridData, countTotalItems } from '@/lib/data-processing';
import { createSearchFunction } from '@/lib/search';

export function useInlineDataExplorer(
  inlineData: string | object,
  fileType: FileType
) {
  const [data, setData] = useState<IndexItem[]>([]);
  const [rawData, setRawData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isValidSyntax, setIsValidSyntax] = useState<{ valid: boolean; format: 'CSV' | 'JSON' | null }>({ valid: false, format: null });

  // Use useCallback to memoize processInlineData
  const processInlineData = useCallback(async () => {
    try {
      const normalizedData = await normalizeData(inlineData, fileType);
      setData(normalizedData);
      setRawData(JSON.stringify(normalizedData, null, 2));
      setTotalItems(countTotalItems(normalizedData));

      const isValid = normalizedData.length > 0;
      const format = fileType === 'text/csv' ? 'CSV' : 'JSON';
      setIsValidSyntax({ valid: isValid, format });
    } catch (err) {
      setError((err as Error).message);
      setIsValidSyntax({ valid: false, format: null });
    } finally {
      setIsLoading(false);
    }
  }, [inlineData, fileType]); // Now processInlineData depends on inlineData and fileType

  // Call processInlineData with useMemo (or useEffect)
  useMemo(() => {
    processInlineData();
  }, [processInlineData]);

  const treeData = useMemo(() => buildTreeData(data), [data]);
  const gridData = useMemo(() => buildGridData(data), [data]);

  const searchFunction = useMemo(() => createSearchFunction(data), [data]);

  const searchResults = useMemo(() => {
    const results = searchFunction(searchTerm);
    return results.map((result) => {
      const originalIndex = result.path[1]
        ? parseInt(result.path[1].replace(/[^\d]/g, ''), 10)
        : undefined;
      return {
        ...result,
        originalIndex,
      };
    });
  }, [searchFunction, searchTerm]);

  return {
    isLoading,
    error,
    treeData,
    gridData,
    searchTerm,
    setSearchTerm,
    searchResults,
    rawData,
    totalItems,
    isValidSyntax,
  };
}
