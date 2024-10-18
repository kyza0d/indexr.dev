
import { useMemo } from 'react';
import { SortConfig, GridDataItem } from '../types';

export const useSortedData = (initialData: GridDataItem[], sortConfig: SortConfig) => {
  return useMemo(() => {
    if (sortConfig.key && sortConfig.direction && sortConfig.key !== 'rowIndex') {
      return [...initialData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return initialData;
  }, [initialData, sortConfig]);
};
