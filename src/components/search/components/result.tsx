import React, { useCallback } from 'react';
import { Highlight } from '@/components/ui/highlight';
import { PathDisplay } from '@/search/components/path-display';
import { ChevronRight, Folder, Clipboard, CornerRightDown } from 'lucide-react';
import { useExplorerContext } from '@/explorer/provider';
import { useTreeContext } from '@/tree/provider';
import { useGridContext } from '@/grid/provider';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { IndexItem, JsonValue, SearchResult as SearchResultType } from '@/types';
import { inferType } from '@/data/lib/infer-type';

interface SearchResultProps {
  result: SearchResultType;
  searchTerm: string;
  depth?: number;
  isDirectoryMatch?: boolean;
}

export const SearchResult: React.FC<SearchResultProps> = React.memo(({
  result,
  searchTerm,
  depth = 0,
  isDirectoryMatch = false
}) => {

  const item = result.item;
  const itemType = inferType(item.data.value);

  const displayValue = item.data.value != null ? item.data.value.toString() : '';

  const pathWithTypes = (item.path || []).map((key: string, index: number) => ({
    key, type: index === (item.path || []).length - 1 ? itemType : 'object',
  }));


  const [isExpanded, setIsExpanded] = React.useState(false)
  const hasNestedItems = itemType === 'object' || itemType === 'array';

  const toggleExpand = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const renderValue = (value: JsonValue) => {
    if (value === undefined) return null;
    if (value === null) return <span className="text-muted-foreground">null</span>;
    if (value === 'Object' || value === 'Array') return null;

    return (
      <Highlight
        text={displayValue}
        searchTerm={searchTerm}
      />
    );
  };

  const { currentView } = useExplorerContext();
  const { expandAndScrollToNode } = useTreeContext();
  const { scrollToRow, getSortedIndex } = useGridContext();

  const handleJumpTo = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      const jumpActions: Record<'tree' | 'grid', () => void> = {
        tree: () => expandAndScrollToNode(item.path),
        grid: () => {
          if (item.originalIndex !== undefined) {
            const sortedIndex = getSortedIndex(item.originalIndex);
            if (sortedIndex !== -1) {
              scrollToRow(sortedIndex);
            } else {
              console.warn('Item not found in sorted data');
            }
          } else {
            console.warn('originalIndex is undefined for indexItem:', item);
          }
        },
      };

      const jumpAction = jumpActions[currentView];
      jumpAction?.();
    },
    [currentView, expandAndScrollToNode, scrollToRow, getSortedIndex, item]
  );


  const handleCopyToClipboard = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(displayValue);
    toast({
      title: 'Copied to clipboard',
      description: displayValue,
    });
  }, [displayValue]);

  return (
    <div className={`
      relative
      ${depth > 0 ? 'ml-4' : ''}
      ${isDirectoryMatch ? 'bg-secondary/20 rounded' : ''}
    `}>
      <div
        className="group flex items-start py-2 px-2 mx-2 hover:bg-accent/50 rounded-md gap-2 min-w-0"
      >
        {/* Left section with expand/collapse and folder icon */}
        <div className="flex-shrink-0 flex items-center gap-2 pt-0.5">
          {(hasNestedItems || isDirectoryMatch) && (
            <button
              onClick={toggleExpand}
              className="p-1 hover:bg-accent rounded-sm flex-shrink-0"
            >
              <ChevronRight
                size={16}
                className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
          )}
          {isDirectoryMatch && (
            <Folder size={16} className="text-primary flex-shrink-0" />
          )}
        </div>

        {/* Middle section with path and value */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start flex-wrap gap-x-2 gap-y-1">
            <div className="min-w-0 flex-shrink flex">
              <PathDisplay
                path={pathWithTypes}
                searchTerm={searchTerm}
              />
              <span className="text-muted-foreground flex-shrink-0">:</span>
            </div>

            {!hasNestedItems && item.data.value !== 'Object' && item.data.value !== 'Array' && (
              <div className="flex items-center gap-1 min-w-0 flex-shrink">
                <span className="text-wrap">
                  {renderValue(item.data.value)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right section with actions */}
        <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="icon"
            onClick={handleJumpTo}
            className="h-8 w-8"
            aria-label="Jump to item in tree view"
          >
            <CornerRightDown size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyToClipboard}
            className="h-8 w-8"
            aria-label="Copy item content"
          >
            <Clipboard size={16} />
          </Button>
        </div>
      </div>

      {/* Nested items */}
      {hasNestedItems && isExpanded && (
        <div className="py-1">
          / In map function for children
          {(item.children || []).map((child: IndexItem, index: number) => {
            const childResult: SearchResultType = {
              id: child.id,
              path: child.path,
              item: child,
              matches: [],
              score: 1,
              originalIndex: child.originalIndex,
            };

            return (
              <SearchResult
                key={`${item.id}-${child.data.key}-${index}`}
                result={childResult}
                searchTerm={searchTerm}
                depth={depth + 1}
                isDirectoryMatch={false}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

SearchResult.displayName = 'SearchResult';

export default SearchResult;
