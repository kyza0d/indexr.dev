import { IndexItem, JsonValue, TreeNode, GridItem, FileType } from '@/types';
import { inferType, InferredType } from '@/lib/type-inference';
import { parse } from 'csv-parse/sync';

export const normalizeData = async (
  data: string | ArrayBuffer | object,
  fileType: FileType
): Promise<IndexItem[]> => {
  let result: IndexItem[];

  if (fileType === 'text/csv') {
    if (typeof data === 'string') {
      result = [normalizeJSON(parseCSV(data))];
    } else if (data instanceof ArrayBuffer) {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(new Uint8Array(data));
      result = [normalizeJSON(parseCSV(text))];
    } else {
      throw new Error('Data must be a string or ArrayBuffer for CSV files');
    }
  } else if (fileType === 'application/json') {
    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
    result = [normalizeJSON(jsonData)];
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  return result;
};

const parseCSV = (csvString: string): JsonValue => {
  const rows: Array<{ [key: string]: string }> = parse(csvString, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (rows.length === 0) {
    throw new Error('CSV file is empty or has no valid data');
  }

  const headers = Object.keys(rows[0]);

  if (headers.length === 0) {
    throw new Error('CSV file has no valid headers');
  }

  const data = rows.map((row) => {
    const obj: { [key: string]: string } = {};
    headers.forEach((header) => {
      obj[header] = row[header] || '';
    });
    return obj;
  });

  return data;
};

const visitedObjects = new WeakSet<object>();

const normalizeJSON = (
  data: JsonValue,
  key: string = 'root',
  path: string[] = []
): IndexItem => {
  const currentPath = [...path, key];
  const type = inferType(data);

  if (typeof data === 'object' && data !== null) {
    if (visitedObjects.has(data)) {
      return {
        id: currentPath.join('.'),
        type: 'circular',
        data: { key, value: 'Circular Reference' },
        path: currentPath,
        rawData: null,
      };
    }
    visitedObjects.add(data);

    if (Array.isArray(data)) {
      const arrayLength = data.length;
      const children = data.map((item, index) =>
        normalizeJSON(item, `[${index}]`, currentPath)
      );

      visitedObjects.delete(data);

      return {
        id: currentPath.join('.'),
        type: 'array',
        data: { key, value: `Array (${arrayLength} items)` },
        path: currentPath,
        children,
        rawData: data,
      };
    } else {
      const entries = Object.entries(data);
      const children = entries.map(([k, v]) =>
        normalizeJSON(v, k, currentPath)
      );

      visitedObjects.delete(data);

      return {
        id: currentPath.join('.'),
        type: 'object',
        data: { key, value: 'Object' },
        path: currentPath,
        children,
        rawData: data,
      };
    }
  } else {
    // Handle primitive types
    return {
      id: currentPath.join('.'),
      type,
      data: { key, value: data },
      path: currentPath,
      rawData: data,
    };
  }
};

export function countTotalItems(data: IndexItem[]): number {
  let count = 0;

  function countRecursive(item: IndexItem) {
    count++;
    if (item.children) {
      item.children.forEach(countRecursive);
    }
  }

  data.forEach(countRecursive);
  return count;
}

export function buildTreeData(data: IndexItem[]): TreeNode[] {
  const buildTreeNode = (item: IndexItem): TreeNode => ({
    key: item.data.key,
    type: item.type as InferredType,
    data: { value: item.data.value },
    children: item.children ? item.children.map(buildTreeNode) : undefined,
    path: item.path.slice(1).map((p) => ({ key: p, type: item.type as InferredType })),
  });

  // Return the children of the root node
  return data[0]?.children?.map(buildTreeNode) || [];
}

export function buildGridData(data: IndexItem[]): GridItem[] {
  if (data.length === 1 && data[0].type === 'array' && data[0].children) {
    return data[0].children.map((item) => {
      if (item.type === 'object' && item.children) {
        return item.children.reduce((acc, child) => {
          const value = child.data.value;
          if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            typeof value === 'boolean' ||
            value === null
          ) {
            acc[child.data.key] = value;
          } else {
            acc[child.data.key] = null;
          }
          return acc;
        }, {} as GridItem);
      }
      return {};
    });
  }
  return [];
}
