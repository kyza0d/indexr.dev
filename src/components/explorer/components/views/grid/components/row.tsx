import React from 'react';

import { ColumnData } from '@/grid/types';
import { Cell } from '@/grid/components/cell';

interface GridRowProps {
  headers: string[];
  columns: Record<string, ColumnData>;
  rowIndex: number;
  activeRowIndex: number | null;
}

export const Row: React.FC<GridRowProps> = ({
  headers,
  columns,
  rowIndex,
  activeRowIndex,
}) => {
  return (
    <>
      {headers.map((header, cellIndex) => (
        <Cell
          key={`${header}-${rowIndex}-${cellIndex}`}
          header={header}
          cellValue={String(columns[header].values[rowIndex] ?? '')}
          rowIndex={rowIndex}
          cellIndex={cellIndex}
          columns={columns}
          activeRowIndex={activeRowIndex}
        />
      ))}
    </>
  );
};
