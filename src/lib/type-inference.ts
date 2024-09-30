import { JsonValue } from '@/types';

export type InferredType =
  | 'undefined'
  | 'any'
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'phone'
  | 'website'
  | 'array'
  | 'object'
  | 'null'
  | 'currency'
  | 'percentage'
  | 'name'
  | 'url'
  | 'empty'
  | 'unknown'
  | 'bigint'
  | 'regex';

export const inferType = (value: any): InferredType => {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') {
    if (value instanceof RegExp) return 'regex';
    return 'object';
  }
  if (typeof value === 'symbol') return 'unknown';
  if (typeof value === 'bigint') return 'bigint';

  const stringValue = String(value).trim();
  if (stringValue === '') return 'empty';

  if (/^(true|false)$/i.test(stringValue)) return 'boolean';
  if (/^-?\d+(\.\d+)?$/.test(stringValue)) return 'number';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(stringValue)) return 'date';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) return 'email';
  if (/^\+?\d{0,3}?[-.\s()]?\d{1,4}?[-.\s()]?\d{1,4}[-.\s()]?\d{1,4}([-.\s()]?\d{1,4})?(x\d{1,5})?$/.test(stringValue)) return 'phone';
  if (/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(stringValue)) return 'website';
  if (/^\$?\d+(,\d{3})*(\.\d+)?$/.test(stringValue)) return 'currency';
  if (/^-?\d+(\.\d+)?%$/.test(stringValue)) return 'percentage';
  if (/^([A-Z][a-z]+\.?\s?)+[A-Z][a-z]+$/.test(stringValue)) return 'name';
  if (/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[^#]*)?(#.*)?$/.test(stringValue)) return 'url';

  return 'string';
};

export const inferItemType = (item: any): InferredType => {
  if (Array.isArray(item)) return 'array';
  if (item !== null && typeof item === 'object') return 'object';
  return inferType(item);
};

export const inferColumnTypes = (data: any[][]): InferredType[] => {
  if (data.length === 0 || data[0].length === 0) return [];

  const columnCount = data[0].length;
  const typeCounts: Array<{ [key in InferredType]?: number }> = Array(columnCount)
    .fill(null)
    .map(() => ({}));

  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < columnCount; col++) {
      const cellType = inferType(data[row][col]);
      typeCounts[col][cellType] = (typeCounts[col][cellType] || 0) + 1;
    }
  }

  return typeCounts.map((counts) => {
    const sortedTypes = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sortedTypes.length > 0 ? (sortedTypes[0][0] as InferredType) : 'unknown';
  });
};

export type TypeInfo = InferredType | { [key: string]: TypeInfo };

export function inferDataTypes(data: JsonValue): TypeInfo {
  if (Array.isArray(data)) {
    return { type: 'array', items: inferDataTypes(data[0]) };
  } else if (typeof data === 'object' && data !== null) {
    const result: { [key: string]: TypeInfo } = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = inferDataTypes(value);
    }
    return result;
  } else {
    return inferType(data);
  }
}

export function getTypeFromPath(typeInfo: TypeInfo, path: string[]): InferredType {
  let current: TypeInfo = typeInfo;
  for (const segment of path) {
    if (typeof current === 'string') {
      return current;
    }
    if (current.type === 'array' && 'items' in current) {
      current = current.items;
    } else if (typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      return 'unknown';
    }
  }
  return typeof current === 'string' ? current : 'object';
}
