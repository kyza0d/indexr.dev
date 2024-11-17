import React, { useEffect, useMemo } from 'react';
import { TableVirtuoso } from 'react-virtuoso';

import { useGridContext } from '@/grid/provider';
import { inferColumnTypes } from '@/components/data/lib/infer-type';
import { useSort } from '@/grid/hooks/use-sort';
import { Header } from '@/grid/components/header';
import { Row } from '@/grid/components/row';

import { GridDataItem, ColumnData } from '@/grid/types';
import {
  CHAR_WIDTH,
  PADDING,
  MIN_COLUMN_WIDTH,
  ROW_INDEX_WIDTH,
  SAMPLE_SIZE
} from '@/grid/constants';

// Add new constant for max width (90 characters plus padding)
const MAX_COLUMN_WIDTH = 90 * CHAR_WIDTH + PADDING;

export const Grid = () => {
  const { virtualListRef, updateSortedIndices, activeRowIndex, gridData } = useGridContext();

  // Store the initial column order
  const columnOrder = useMemo(() => {
    if (gridData.length === 0) return [];
    return ['rowIndex', ...Object.keys(gridData[0]).filter(key =>
      key !== 'originalIndex' && key !== 'id'
    )];
  }, [gridData]); // Only compute once when gridData is first loaded

  // Use our sorting hook
  const { sortConfig, sortedData, handleSort } = useSort(gridData);

  // Update sorted indices in context when sort changes
  useEffect(() => {
    updateSortedIndices(sortedData.map(item => item.originalIndex));
  }, [sortedData, updateSortedIndices]);

  // Get grid data configuration using the fixed column order
  const { columns, rowCount } = useGridData(sortedData);

  // Virtual table components configuration
  const components = useMemo(() => getVirtuosoComponents(), []);

  return (
    <TableVirtuoso
      ref={virtualListRef}
      data={sortedData}
      totalCount={rowCount}
      overscan={200}
      components={components}
      fixedHeaderContent={() => (
        <tr className="relative" role="row">
          {columnOrder.map((header) => (
            <Header
              key={header}
              header={header}
              column={columns[header]}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          ))}
        </tr>
      )}
      itemContent={(index) => (
        <Row
          headers={columnOrder}
          columns={columns}
          rowIndex={index}
          activeRowIndex={activeRowIndex}
        />
      )}
    />
  );
};

interface GridData {
  columns: Record<string, ColumnData>;
  rowCount: number;
}

const useGridData = (data: GridDataItem[]): GridData => {
  return useMemo(() => {
    if (data.length === 0) {
      console.warn('GridView received empty data');
      return { columns: {}, rowCount: 0 };
    }

    const columns = initializeColumns(data);
    calculateColumnWidths(columns);

    return {
      columns,
      rowCount: data.length,
    };
  }, [data]);
};

const initializeColumns = (data: GridDataItem[]): Record<string, ColumnData> => {
  const sampleData = data.slice(0, SAMPLE_SIZE);
  const inferredTypes = inferColumnTypes(sampleData.map(Object.values));

  const columns: Record<string, ColumnData> = {
    rowIndex: {
      values: data.map((_, index) => String(index + 1)),
      type: 'number',
      path: ['rowIndex'],
      width: ROW_INDEX_WIDTH,
    },
  };

  Object.keys(data[0]).forEach((key, index) => {
    if (key !== 'originalIndex' && key !== 'id') {
      columns[key] = {
        values: data.map((row) => String(row[key] ?? '')),
        type: inferredTypes[index] || 'unknown',
        path: [key],
        width: 0,
      };
    }
  });

  return columns;
};

const calculateColumnWidths = (columns: Record<string, ColumnData>) => {
  Object.entries(columns).forEach(([key, column]) => {
    if (key !== 'rowIndex') {
      const sampleValues = column.values.slice(0, SAMPLE_SIZE);
      const maxLength = Math.max(
        key.length,
        ...sampleValues.map((v) => String(v ?? '').length)
      );

      // Calculate width with min and max constraints
      column.width = Math.min(
        Math.max(maxLength * CHAR_WIDTH + PADDING, MIN_COLUMN_WIDTH),
        MAX_COLUMN_WIDTH
      );
    }
  });
};

const getVirtuosoComponents = () => ({
  Table: (props: React.HTMLProps<HTMLTableElement>) => (
    <table
      {...props}
      style={{ tableLayout: 'fixed', width: '100%' }}
      className="w-full border-collapse"
      role="grid"
    />
  ),
  TableHead: (props: React.HTMLProps<HTMLTableSectionElement>) => (
    <thead
      {...props}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1,
        backgroundColor: 'var(--background)',
      }}
    />
  ),
});
