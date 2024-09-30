import { InferredType } from '@/utils/type-inference';

export type JsonValue = "object" | "array" | string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface TreeNode {
  key: string;
  type: InferredType;
  data: {
    value: JsonValue;
  };
  children?: TreeNode[];
  path: Array<{ key: string; type: InferredType }>;
}

export interface IndexItem {
  id: string;
  type: InferredType;
  data: {
    key: string;
    value: JsonValue;
  };
  path: string[];
  children?: IndexItem[];
  rawData: JsonValue | string;
  flattenedPath?: string;
  originalIndex?: number;
  currentIndex?: number;
}

export interface SearchResult {
  item: IndexItem;
  matches: Array<{
    key: string;
    value: string;
    indices: Array<[number, number]>;
    rowIndex: number;
    columnIndex: number;
  }>;
}

export interface GridItem {
  [key: string]: string | number | boolean | null;
}

export interface ColumnData {
  values: Array<string | number | boolean | null>;
  width: number;
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  fileType: string;
  data: IndexItem[];
  getData: () => Promise<IndexItem[]>;
  rawData: JsonValue | string;
  fileUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

export interface ExampleDataset {
  id: string
  name: string
  description: string
  fileType: FileType
}

export type FileType = 'application/json' | 'text/csv' | string;
