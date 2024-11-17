import { InferredType } from '@/data/lib/infer-type';
import { FuseResultMatch } from 'fuse.js';

export type JsonValue = "object" | "array" | string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface TreeNode {
  key: string;
  type: InferredType;
  data: {
    value: JsonValue;
  };
  path: { key: string; type: InferredType }[];
  children?: TreeNode[];
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
  searchableText?: string;
  searchContext?: {
    lineNumber: number;
    columnNumber: number;
    parentContext?: string;
  };
}

export interface SearchResult {
  id: string;
  path: string[];
  matches: readonly FuseResultMatch[]; // Updated to readonly
  score: number;
  item: IndexItem;
  originalIndex?: number;
  context?: {
    before: string[];
    after: string[];
  };
}

export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  fileType: string;
  fileUrl: string;
  isPublic: boolean;
  isSaved: boolean;
  userId: string;
  userName?: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  tags: { id: string; name: string }[];
  user?: { name: string | null; image: string | null };
  data?: any;
  getData?: () => any;
  rawData?: string;
}

export type FileType = 'application/json' | 'text/csv' | string;
