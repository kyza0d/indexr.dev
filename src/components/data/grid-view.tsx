import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { useGridContext } from './grid-context';
import { inferColumnTypes, InferredType } from '@/lib/type-inference';
import { getIcon } from '@/lib/type-icon';
import { GoTriangleUp, GoTriangleDown } from 'react-icons/go';

interface GridItem {
  [key: string]: string | number | boolean | null;
}

type GridDataItem = GridItem & { originalIndex: number };

interface ColumnData {
  values: string[];
  type: InferredType;
  path: string[];
  width: number;
}

interface GridViewProps {
  data: GridItem[];
}

const CHAR_WIDTH = 8;
const PADDING = 100;
const MIN_COLUMN_WIDTH = 120;
const ROW_INDEX_WIDTH = 60;
const SAMPLE_SIZE = 100;

export const GridView: React.FC<GridViewProps> = ({ data }) => {
  const { virtualListRef, updateSortedIndices, activeRowIndex } = useGridContext();

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc' | '';
  }>({ key: '', direction: '' });

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const initialData: GridDataItem[] = useMemo(
    () => data.map((item, index) => ({ ...item, originalIndex: index })),
    [data]
  );

  const sortedData = useMemo(() => {
    if (sortConfig.key && sortConfig.direction && sortConfig.key !== 'rowIndex') {
      return [...initialData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        const aNum = Number(aValue);
        const bNum = Number(bValue);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? bNum - aNum : aNum - bNum;
        } else {
          const aString = String(aValue ?? '').toLowerCase();
          const bString = String(bValue ?? '').toLowerCase();
          return sortConfig.direction === 'asc'
            ? aString.localeCompare(bString)
            : bString.localeCompare(aString);
        }
      });
    }
    return initialData;
  }, [initialData, sortConfig]);

  useEffect(() => {
    updateSortedIndices(sortedData.map(item => item.originalIndex));
  }, [sortedData, updateSortedIndices]);

  const { columns, headers, rowCount } = useGridData(sortedData, columnWidths);

  const handleSort = useCallback((header: string) => {
    setSortConfig((prevConfig) => {
      let newDirection: 'asc' | 'desc' | '';
      if (prevConfig.key === header) {
        if (prevConfig.direction === 'asc') newDirection = 'desc';
        else if (prevConfig.direction === 'desc') newDirection = '';
        else newDirection = 'asc';
      } else {
        newDirection = 'asc';
      }

      return {
        key: newDirection ? header : '',
        direction: newDirection,
      };
    });
  }, []);

  const handleColumnResize = useCallback((header: string, newWidth: number) => {
    setColumnWidths(prev => ({
      ...prev,
      [header]: Math.max(newWidth, MIN_COLUMN_WIDTH)
    }));
  }, []);

  const handleColumnMouseDown = useCallback((header: string, startWidth: number) => (e: React.MouseEvent) => {
    const startX = e.clientX;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startX;
      handleColumnResize(header, startWidth + diff);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleColumnResize]);

  const renderCell = useRenderCell(columns, activeRowIndex);
  const renderRow = useRenderRow(headers, columns, renderCell);
  const renderHeader = useRenderHeader(headers, columns, sortConfig, handleSort, handleColumnMouseDown);

  const components = useMemo(() => getVirtuosoComponents(), []);

  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <TableVirtuoso
      ref={virtualListRef}
      data={sortedData}
      totalCount={rowCount}
      overscan={200}
      components={components}
      fixedHeaderContent={renderHeader}
      itemContent={renderRow}
    />
  );
};

const useGridData = (
  data: GridDataItem[],
  columnWidths: Record<string, number>
) => {
  return useMemo(() => {
    if (data.length === 0) {
      console.warn('GridView received empty data');
      return { columns: {}, headers: [], rowCount: 0, totalWidth: 0 };
    }

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
      if (key !== 'originalIndex') { // Exclude originalIndex from being a visible column
        columns[key] = {
          values: data.map((row) => String(row[key] ?? '')),
          type: inferredTypes[index] || 'unknown',
          path: [key],
          width: 0,
        };
      }
    });

    Object.entries(columns).forEach(([key, column]) => {
      if (key !== 'rowIndex') {
        const sampleValues = column.values.slice(0, SAMPLE_SIZE);
        const maxLength = Math.max(
          key.length,
          ...sampleValues.map((v) => String(v ?? '').length)
        );
        column.width = columnWidths[key] || Math.max(
          maxLength * CHAR_WIDTH + PADDING,
          MIN_COLUMN_WIDTH
        );
      }
    });

    return {
      columns,
      headers: ['rowIndex', ...Object.keys(data[0]).filter(key => key !== 'originalIndex')],
      rowCount: data.length,
    };
  }, [data, columnWidths]);
};

/**
 * Custom hook to render a table row.
 * @param headers - The array of header names.
 * @param columns - The columns data.
 * @param renderCell - Function to render a cell.
 * @returns A function that renders a row.
 */
const useRenderRow = (
  headers: string[],
  columns: Record<string, ColumnData>,
  renderCell: (
    header: string,
    cellValue: string,
    rowIndex: number,
    cellIndex: number
  ) => JSX.Element
) => {
  return useCallback(
    (rowIndex: number) => (
      <>
        {headers.map((header, cellIndex) =>
          renderCell(
            header,
            String(columns[header].values[rowIndex] ?? ''),
            rowIndex,
            cellIndex
          )
        )}
      </>
    ),
    [headers, columns, renderCell]
  );
};

const useRenderHeader = (
  headers: string[],
  columns: Record<string, ColumnData>,
  sortConfig: { key: string; direction: 'asc' | 'desc' | '' },
  handleSort: (header: string) => void,
  handleColumnMouseDown: (header: string, startWidth: number) => (e: React.MouseEvent) => void,
) => {
  return useCallback(
    () => (
      <tr className='relative' role="row">
        {headers.map((header) => {
          const { icon: Icon, className } = getIcon(columns[header].type);
          const isRowIndex = header === 'rowIndex';
          const isSorted = sortConfig.key === header;

          const headerClassNames = [
            'before:border-b before:border-border before:content-[""] before:inset-0 before:absolute relative group px-2 py-2 text-left text-sm font-medium text-muted-foreground tracking-wider group bg-background',
            isRowIndex && 'sticky left-0 z-10 before:-z-10 before:border-r before:bg-background before:inset-0',
            !isRowIndex && 'cursor-pointer select-none ',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <th
              key={header}
              className={headerClassNames}
              style={{ width: columns[header].width }}
              onClick={() => !isRowIndex && handleSort(header)}
              title={!isRowIndex ? 'Click to sort' : undefined}
              role="columnheader"
            >
              <div className={`flex items-center justify-between rounded-md space-x-2 h-10 px-4 before:absolute before:content-[''] group-hover:bg-accent`}>
                <div className="flex items-center space-x-2">
                  {!isRowIndex && <Icon size={18} className={`${className} group-hover:inline-block`} />}
                  <span className="truncate">{isRowIndex ? '#' : header}</span>
                </div>
                {!isRowIndex && (
                  <div className="flex flex-col -space-y-1">
                    <GoTriangleUp
                      size={14}
                      className={`
                        ${isSorted && sortConfig.direction === 'asc' ? 'text-foreground' : 'text-muted-foreground/35'}
                        ${!isSorted && 'opacity-0 group-hover:opacity-100'}
                        transition-opacity
                      `}
                    />
                    <GoTriangleDown
                      size={14}
                      className={`
                        ${isSorted && sortConfig.direction === 'desc' ? 'text-foreground' : 'text-muted-foreground/35'}
                        ${!isSorted && 'opacity-0 group-hover:opacity-100'}
                        transition-opacity
                      `}
                    />
                  </div>
                )}
              </div>
              {!isRowIndex && (
                <div
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-accent"
                  onMouseDown={handleColumnMouseDown(header, columns[header].width)}
                />
              )}
            </th>
          );
        })}
      </tr>
    ),
    [headers, columns, sortConfig, handleSort, handleColumnMouseDown]
  );
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

const useRenderCell = (
  columns: Record<string, ColumnData>,
  activeRowIndex: number | null
) => {
  return useCallback(
    (
      header: string,
      cellValue: string,
      rowIndex: number,
      cellIndex: number
    ) => {
      const isActive = activeRowIndex === rowIndex;
      const isRowIndex = header === 'rowIndex';

      const cellClassNames = [
        'border-b pl-4 py-4 whitespace-nowrap text-sm text-muted-foreground transition-colors duration-300',
        isActive && 'bg-accent/60',
        isRowIndex && 'sticky left-0 bg-muted before:content-[""] before:absolute before:-z-10 before:border-r before:bg-background before:border-border before:inset-0',
      ]
        .filter(Boolean)
        .join(' ');

      return (
        <td
          key={`${header}-${rowIndex}-${cellIndex}`}
          className={cellClassNames}
          style={{ width: columns[header].width }}
          role="gridcell"
          tabIndex={0}
        >
          {cellValue}
        </td>
      );
    },
    [columns, activeRowIndex]
  );
};

export default GridView;
