import { TableVirtuosoHandle } from 'react-virtuoso';
import { InferredType } from '@/components/data/lib/infer-type';
import { JsonValue } from '@/types';

export interface GridViewProps {
  data: GridItem[];
}

export interface GridItem {
  [key: string]: string | number | boolean | null;
}

export type GridDataItem = GridItem & {
  originalIndex: number;
  id: string;
};

export interface GridIndexItem {
  id: string;
  type: InferredType;
  data: {
    key: string;
    value: JsonValue;
  };
  path: string[];
  children?: GridIndexItem[];
  rawData: JsonValue | string;
  flattenedPath?: string;
  originalIndex?: number;
  currentIndex?: number;
}


export interface GridContextType {
  virtualListRef: React.RefObject<TableVirtuosoHandle>;
  currentView: 'tree' | 'grid';
  scrollToRow: (rowIndex: number) => void;
  activeRowIndex: number | null;
  updateSortedIndices: (indices: number[]) => void;
  getSortedIndex: (rowIndex: number) => number;
  gridData: GridItem[];
}

export interface GridProviderProps {
  children: React.ReactNode;
  currentView: 'tree' | 'grid';
  data: GridIndexItem[];
}

export interface ColumnData {
  values: string[];
  type: InferredType;
  path: string[];
  width: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc' | '';
}
