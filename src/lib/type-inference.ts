export type InferredType =
  | 'undefined'
  | 'any'
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'email'
  | 'array'
  | 'object'
  | 'null'
  | 'currency'
  | 'percentage'
  | 'empty'
  | 'unknown'
  | 'bigint'
  | 'regex';

export function inferType(value: any): InferredType {
  if (value == null) return 'null';

  const valueType = typeof value;

  if (valueType === 'boolean') return 'boolean';
  if (valueType === 'number' || valueType === 'bigint') return 'number';
  if (Array.isArray(value)) return 'array';
  if (value instanceof RegExp) return 'regex';
  if (valueType === 'object') return 'object';

  const stringValue = String(value).trim();
  if (stringValue === '') return 'empty';

  const lowerValue = stringValue.toLowerCase();
  if (lowerValue === 'true' || lowerValue === 'false') return 'boolean';

  const numericValue = Number(stringValue.replace(/,/g, ''));
  if (!isNaN(numericValue)) return 'number';

  if (!isNaN(Date.parse(stringValue))) return 'date';

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) return 'email';

  if (/^-?\d+(\.\d+)?%$/.test(stringValue)) return 'percentage';

  if (/^[\$€£¥₹]\s?-?\d+(,\d{3})*(\.\d+)?$/.test(stringValue.replace(/\s/g, ''))) {
    return 'currency';
  }

  return 'string';
}

export type TypeInfo = InferredType | { [key: string]: TypeInfo };

export function inferDataTypes(data: JsonValue): TypeInfo {
  if (Array.isArray(data)) {
    return { type: 'array', items: inferDataTypes(data[0]) };
  } else if (data && typeof data === 'object') {
    const result: { [key: string]: TypeInfo } = {};
    for (const key in data) {
      result[key] = inferDataTypes((data as any)[key]);
    }
    return result;
  } else {
    return inferType(data);
  }
}

export function getTypeFromPath(typeInfo: TypeInfo, path: string[]): InferredType {
  let current: TypeInfo = typeInfo;
  for (const segment of path) {
    if (typeof current === 'string') return current;
    if ('type' in current && current.type === 'array' && 'items' in current) {
      current = current.items;
    } else if (typeof current === 'object' && segment in current) {
      current = current[segment];
    } else {
      return 'unknown';
    }
  }
  return typeof current === 'string' ? current : 'object';
}

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
    const sortedTypes = Object.entries(counts).sort((a, b) => (b[1] as number) - (a[1] as number));
    return sortedTypes.length > 0 ? (sortedTypes[0][0] as InferredType) : 'unknown';
  });
};

