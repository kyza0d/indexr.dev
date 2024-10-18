import { IndexItem, JsonValue, TreeNode, GridItem, FileType } from '@/types';
import { inferType, InferredType } from '@/lib/type-inference';
import { parse } from 'csv-parse/sync';

export const normalizeData = async (
  data: string | ArrayBuffer | object,
  fileType: FileType
): Promise<IndexItem[]> => {
  if (fileType === 'text/csv') {
    const textData =
      typeof data === 'string'
        ? data
        : data instanceof ArrayBuffer
          ? new TextDecoder('utf-8').decode(new Uint8Array(data))
          : null;

    if (textData === null) {
      throw new Error('Data must be a string or ArrayBuffer for CSV files');
    }

    return [normalizeJSON(parseCSV(textData))];
  }

  if (fileType === 'application/json') {
    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
    return [normalizeJSON(jsonData)];
  }

  throw new Error(`Unsupported file type: ${fileType}`);
};

const parseCSV = (csvString: string): JsonValue => {
  const rows: Array<{ [key: string]: string }> = parse(csvString, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (rows.length === 0 || !Object.keys(rows[0]).length) {
    throw new Error('CSV file is empty or has no valid data');
  }

  const headers = Object.keys(rows[0]);

  return rows.map((row) =>
    headers.reduce(
      (acc, header) => ({ ...acc, [header]: row[header] || '' }),
      {}
    )
  );
};

const normalizeJSON = (
  data: JsonValue,
  key: string = 'root',
  path: string[] = []
): IndexItem => {
  const visitedObjects = new WeakSet<object>();

  const recursiveNormalize = (
    data: JsonValue,
    key: string,
    path: string[]
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

      const children = Array.isArray(data)
        ? data.map((item, index) =>
          recursiveNormalize(item, `[${index}]`, currentPath)
        )
        : Object.entries(data).map(([k, v]) =>
          recursiveNormalize(v, k, currentPath)
        );

      return {
        id: currentPath.join('.'),
        type: Array.isArray(data) ? 'array' : 'object',
        data: {
          key,
          value: Array.isArray(data)
            ? `Array (${data.length} items)`
            : 'Object',
        },
        path: currentPath,
        children,
        rawData: data,
      };
    }

    return {
      id: currentPath.join('.'),
      type,
      data: { key, value: data },
      path: currentPath,
      rawData: data,
    };
  };

  return recursiveNormalize(data, key, path);
};

export function countTotalItems(data: IndexItem[]): number {
  let count = 0;

  const countRecursive = (item: IndexItem) => {
    count++;
    item.children?.forEach(countRecursive);
  };

  data.forEach(countRecursive);
  return count;
}

export function buildTreeData(data: IndexItem[]): TreeNode[] {
  const buildTreeNode = (item: IndexItem): TreeNode => ({
    key: item.data.key,
    type: item.type as InferredType,
    data: { value: item.data.value },
    children: item.children?.map(buildTreeNode),
    path: item.path.slice(1).map((p) => ({
      key: p,
      type: item.type as InferredType,
    })),
  });

  return data.flatMap((item) => item.children?.map(buildTreeNode) || []);
}

export function buildGridData(data: IndexItem[]): GridItem[] {
  if (data.length === 1 && data[0].type === 'array' && data[0].children) {
    return data[0].children.map((item) => {
      if (item.type === 'object' && item.children) {
        return item.children.reduce((acc, child) => {
          const value = child.data.value;
          acc[child.data.key] =
            typeof value === 'object' ? null : value;
          return acc;
        }, {} as GridItem);
      }
      return {};
    });
  }
  return [];
}
