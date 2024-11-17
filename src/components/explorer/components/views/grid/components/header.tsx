import React from 'react';
import { GoTriangleUp, GoTriangleDown } from 'react-icons/go';
import { Icon as IconType } from '@/components/layout/icons';
import { ColumnData } from '@/grid/types';
import { SortConfig } from '@/grid/hooks/use-sort';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  header: string;
  column: ColumnData;
  sortConfig: SortConfig;
  onSort: (header: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  header,
  column,
  sortConfig,
  onSort,
}) => {
  const { icon: Icon, className } = IconType(column.type);
  const isRowIndex = header === 'rowIndex';
  const isSorted = sortConfig.key === header;

  const headerClassNames = [
    'before:border-b before:border-border before:content-[""] before:inset-0 before:absolute relative group px-2 py-2 text-left text-sm font-medium text-muted-foreground tracking-wider group bg-background',
    isRowIndex && 'sticky left-0 z-10 before:-z-10 before:border-r before:bg-primary/30 before:inset-0',
    !isRowIndex && 'cursor-pointer select-none',
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!isRowIndex) {
      onSort(header);
    }
  };

  const displayHeader = isRowIndex ? '#' : header;
  const needsTooltip = displayHeader.length > 90;

  const headerContent = (
    <div className="flex items-center justify-between rounded-md space-x-2 h-10 px-4 before:absolute before:content-[''] group-hover:bg-accent">
      <div className="flex items-center space-x-2 min-w-0 max-w-full">
        {!isRowIndex && <Icon size={18} className={`${className} group-hover:inline-block flex-shrink-0`} />}
        <span className="truncate max-w-[90ch]">{displayHeader}</span>
      </div>
      {!isRowIndex && (
        <div className="flex flex-col flex-shrink-0">
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
  );

  const headerWithTooltip = needsTooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {headerContent}
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-[400px] break-words">{displayHeader}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : headerContent;

  return (
    <th
      className={headerClassNames}
      style={{ width: column.width }}
      onClick={handleClick}
      title={!isRowIndex && !needsTooltip ? 'Click to sort' : undefined}
      role="columnheader"
    >
      {headerWithTooltip}
    </th>
  );
};
