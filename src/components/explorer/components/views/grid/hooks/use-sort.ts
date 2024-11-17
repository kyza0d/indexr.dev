import { useState, useMemo, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc' | '';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc' | '';
}

export type SortableValue = string | number | Date | boolean | null | undefined;

export interface SortOptions<T> {
  initialSortKey?: keyof T;
  initialDirection?: SortDirection;
  customComparators?: {
    [K in keyof T]?: (a: T[K], b: T[K]) => number;
  };
}

export function useSort<T extends Record<string, SortableValue>>(
  data: T[],
  options: SortOptions<T> = {}
) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: (options.initialSortKey as string) || '',
    direction: options.initialDirection || ''
  });

  const getNextSortDirection = (currentDirection: SortDirection): SortDirection => {
    const sequence: SortDirection[] = ['asc', 'desc', ''];
    const currentIndex = sequence.indexOf(currentDirection);
    return sequence[(currentIndex + 1) % sequence.length];
  };

  // Helper function to check if a value is numeric (including numeric strings)
  const isNumeric = (value: any): boolean => {
    if (typeof value === 'number') return true;
    if (typeof value !== 'string') return false;
    return !isNaN(Number(value)) && !isNaN(parseFloat(value));
  };

  const compareValues = useCallback((a: SortableValue, b: SortableValue, direction: SortDirection): number => {
    // Handle null/undefined values - keep them at the bottom regardless of sort direction
    if (a == null && b == null) return 0;
    if (a == null) return 1;  // Nulls always at bottom
    if (b == null) return -1; // Nulls always at bottom

    // Helper function to safely convert to number
    const toNumber = (value: any): number | null => {
      if (typeof value === 'number') return value;
      if (!isNumeric(value)) return null;
      return Number(value);
    };

    // Handle booleans by converting to "true" or "false" strings
    // This ensures they sort consistently with other value types
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      const aStr = String(a);
      const bStr = String(b);
      return direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    }

    // Try to convert to numbers if possible
    const aNum = toNumber(a);
    const bNum = toNumber(b);

    // If both values can be converted to numbers, use numeric comparison
    if (aNum !== null && bNum !== null) {
      return direction === 'asc' ? aNum - bNum : bNum - aNum;
    }

    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return direction === 'asc' ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
    }

    // Default to string comparison
    const aString = String(a).toLowerCase();
    const bString = String(b).toLowerCase();

    // Try numeric comparison one more time for strings that might represent numbers
    const aStringNum = toNumber(aString);
    const bStringNum = toNumber(bString);

    if (aStringNum !== null && bStringNum !== null) {
      return direction === 'asc' ? aStringNum - bStringNum : bStringNum - aStringNum;
    }

    return direction === 'asc' ? aString.localeCompare(bString) : bString.localeCompare(aString);
  }, []);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prevConfig) => {
      const newDirection = prevConfig.key === key
        ? getNextSortDirection(prevConfig.direction)
        : 'asc';

      return {
        key: newDirection ? key : '',
        direction: newDirection,
      };
    });
  }, []);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    try {
      return [...data].sort((a, b) => {
        const key = sortConfig.key;

        // Access the property using key as keyof T
        const valueA = a[key as keyof T];
        const valueB = b[key as keyof T];

        if (options.customComparators?.[key as keyof T]) {
          return options.customComparators[key as keyof T]!(valueA, valueB);
        }

        return compareValues(valueA, valueB, sortConfig.direction);
      });
    } catch (error) {
      console.error('Error sorting data:', error);
      return data;
    }
  }, [data, sortConfig, compareValues, options.customComparators]);

  return {
    sortConfig,
    sortedData,
    handleSort,
    resetSort: useCallback(() => {
      setSortConfig({ key: '', direction: '' });
    }, []),
  };
}
