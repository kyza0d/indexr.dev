import { IndexItem, JsonValue, TreeNode, GridItem, FileType } from '@/types';
import { inferType, InferredType } from '@/lib/type-inference';
import { parse } from 'csv-parse/sync';

export const normalizeData = async (data: string | ArrayBuffer | object, fileType: FileType): Promise<IndexItem[]> => {
  if (fileType === 'text/csv') {
    return normalizeCSV(data as string | ArrayBuffer);
  } else if (fileType === 'application/json') {
    const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
    return normalizeJSON(jsonData);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
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

const normalizeJSON = (data: JsonValue, key: string = 'root', path: string[] = []): IndexItem[] => {
  const currentPath = [...path, key];
  const type = inferType(data);

  if (Array.isArray(data)) {
    return [{
      id: currentPath.join('.'),
      type: 'array',
      data: { key, value: `Array` },
      path: currentPath,
      children: data.map((item, index) => normalizeJSON(item, `[${index}]`, currentPath)[0]),
      rawData: data
    }];
  } else if (typeof data === 'object' && data !== null) {
    return [{
      id: currentPath.join('.'),
      type: 'object',
      data: { key, value: 'Object' },
      path: currentPath,
      children: Object.entries(data).flatMap(([k, v]) => normalizeJSON(v, k, currentPath)),
      rawData: data
    }];
  } else {
    return [{
      id: currentPath.join('.'),
      type,
      data: { key, value: data },
      path: currentPath,
      rawData: data
    }];
  }
};

const normalizeCSV = (csvString: string): IndexItem[] => {
  // Parse the CSV string
  const rows = parse(csvString, {
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

  const data = rows.map(row => {
    const obj: { [key: string]: string } = {};
    headers.forEach(header => {
      obj[header] = row[header] || '';
    });
    return obj;
  });

  return normalizeJSON(data);
};

export function buildTreeData(data: IndexItem[]): TreeNode[] {
  const buildTreeNode = (item: IndexItem): TreeNode => ({
    key: item.data.key,
    type: item.type as InferredType,
    data: { value: item.data.value },
    children: item.children ? item.children.map(buildTreeNode) : undefined,
    path: item.path.slice(1).map((p) => ({ key: p, type: item.type as InferredType }))
  });

  // Return the children of the root node
  return data[0]?.children?.map(buildTreeNode) || [];
}

export function buildGridData(data: IndexItem[]): GridItem[] {
  if (data.length === 1 && data[0].type === 'array' && data[0].children) {
    return data[0].children.map(item => {
      if (item.type === 'object' && item.children) {
        return item.children.reduce((acc, child) => {
          acc[child.data.key] = child.data.value;
          return acc;
        }, {} as GridItem);
      }
      return {};
    });
  }
  return [];
}
