import React from 'react';
import { ColumnData } from '@/grid/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GridCellProps {
  header: string;
  cellValue: string;
  rowIndex: number;
  cellIndex: number;
  columns: Record<string, ColumnData>;
  activeRowIndex: number | null;
}

export const Cell: React.FC<GridCellProps> = ({
  header,
  cellValue,
  rowIndex,
  cellIndex,
  columns,
  activeRowIndex,
}) => {
  const isActive = activeRowIndex === rowIndex;
  const isRowIndex = header === 'rowIndex';
  const cellClassNames = [
    'border-b pl-4 py-4 whitespace-nowrap text-sm text-muted-foreground transition-colors duration-300',
    isRowIndex && 'sticky left-0 before:content-[""] before:absolute before:-z-10 before:border-r before:bg-primary/30 before:border-border before:inset-0',
    isActive && !isRowIndex && 'z-10 bg-primary',
  ]
    .filter(Boolean)
    .join(' ');

  // Function to truncate text and add ellipsis
  const truncateText = (text: string, maxLength: number = 90) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  const displayValue = truncateText(cellValue);
  const needsTooltip = cellValue.length > 90;

  const cellContent = (
    <div className="max-w-[90ch] truncate">
      {displayValue}
    </div>
  );

  return (
    <td
      key={`${header}-${rowIndex}-${cellIndex}`}
      className={cellClassNames}
      style={{ width: columns[header].width }}
      role="gridcell"
      tabIndex={0}
    >
      {needsTooltip ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {cellContent}
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[400px] break-words">{cellValue}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : cellContent}
    </td>
  );
};
