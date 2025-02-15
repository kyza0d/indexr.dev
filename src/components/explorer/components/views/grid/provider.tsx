import React, { createContext, useContext, useRef, useCallback, useState, useMemo } from 'react';
import { TableVirtuosoHandle } from 'react-virtuoso';
import { GridIndexItem, GridDataItem } from '@/grid/types';

interface GridContextType {
  virtualListRef: React.RefObject<TableVirtuosoHandle | null>;
  currentView: 'tree' | 'grid';
  scrollToRow: (rowIndex: number) => void; // Accepts index in sorted data
  activeRowIndex: number | null;
  updateSortedIndices: (indices: number[]) => void;
  getSortedIndex: (originalIndex: number) => number;
  gridData: GridDataItem[];
}

interface GridProviderProps {
  children: React.ReactNode;
  currentView: 'tree' | 'grid';
  data: GridIndexItem[];
}

const GridContext = createContext<GridContextType | undefined>(undefined);

export function buildGridData(data: GridIndexItem[]): GridDataItem[] {
  if (data.length === 1 && data[0].type === 'array' && data[0].children) {
    return data[0].children.map((item, index) => {
      const gridItem: GridDataItem = { originalIndex: index, id: item.id };
      if (item.type === 'object' && item.children) {
        item.children.forEach((child) => {
          const value = child.data.value;
          gridItem[child.data.key] =
            typeof value === 'object' ? null : value;
        });
      }
      return gridItem;
    });
  }
  return [];
}

export const GridProvider: React.FC<GridProviderProps> = ({ children, currentView, data = [] }) => {
  const virtualListRef = useRef<TableVirtuosoHandle>(null);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);

  // Build grid data using memo
  const gridData = useMemo(() => buildGridData(data), [data]);

  const scrollToRow = useCallback((rowIndex: number) => {
    console.log('[GridProvider] scrollToRow called with rowIndex:', rowIndex);
    if (virtualListRef.current) {
      virtualListRef.current.scrollToIndex({
        index: rowIndex,
        align: 'center',
        behavior: 'smooth',
      });
      setActiveRowIndex(rowIndex);
    } else {
      console.error('[GridProvider] virtualListRef.current is null');
    }
  }, [virtualListRef]);

  const updateSortedIndices = useCallback((indices: number[]) => {
    console.log('[GridProvider] Updating sortedIndices:', indices);
    setSortedIndices(indices);
  }, []);

  const getSortedIndex = useCallback((originalIndex: number) => {
    const sortedIndex = sortedIndices.indexOf(originalIndex);
    console.log('[GridProvider] getSortedIndex:', {
      originalIndex,
      sortedIndex,
      sortedIndices,
    });
    return sortedIndex;
  }, [sortedIndices]);

  return (
    <GridContext.Provider value={{
      virtualListRef,
      currentView,
      scrollToRow,
      activeRowIndex,
      updateSortedIndices,
      getSortedIndex,
      gridData
    }}>
      {children}
    </GridContext.Provider>
  );
};

export const useGridContext = () => {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error('useGridContext must be used within a GridProvider');
  }
  return context;
};
