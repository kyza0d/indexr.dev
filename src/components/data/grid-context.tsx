import React, { createContext, useContext, useRef, useCallback, useState } from 'react';
import { TableVirtuosoHandle } from 'react-virtuoso';

interface GridContextType {
  virtualListRef: React.RefObject<TableVirtuosoHandle>;
  currentView: 'tree' | 'grid';
  scrollToRow: (rowIndex: number) => void;
  activeRowIndex: number | null;
  updateSortedIndices: (indices: number[]) => void;
  getSortedIndex: (rowIndex: number) => number;
}

const GridContext = createContext<GridContextType | undefined>(undefined);

interface GridProviderProps {
  children: React.ReactNode;
  currentView: 'tree' | 'grid';
}

export const GridProvider: React.FC<GridProviderProps> = ({ children, currentView }) => {
  const virtualListRef = useRef<TableVirtuosoHandle>(null);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);

  const scrollToRow = useCallback((originalIndex: number) => {
    if (virtualListRef.current) {
      const sortedIndex = sortedIndices.findIndex(index => index === originalIndex);
      if (sortedIndex !== -1) {
        virtualListRef.current.scrollToIndex({ index: sortedIndex, align: 'center', behavior: 'smooth' });
        setActiveRowIndex(sortedIndex);
      } else {
        console.error('Original row index not found in sorted data');
      }
    } else {
      console.error('VirtualListRef is not available');
    }
  }, [sortedIndices]);

  const updateSortedIndices = useCallback((indices: number[]) => {
    setSortedIndices(indices);
  }, []);


  const getSortedIndex = useCallback((originalIndex: number) => {
    return sortedIndices.indexOf(originalIndex);
  }, [sortedIndices]);

  return (
    <GridContext.Provider value={{
      virtualListRef,
      currentView,
      scrollToRow,
      activeRowIndex,
      updateSortedIndices,
      getSortedIndex
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
