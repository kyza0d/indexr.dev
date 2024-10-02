import React, { useCallback } from 'react';
import { IndexItem, JsonValue } from '@/types';
import { Highlight } from '@/components/ui/highlight';
import { PathDisplay } from '@/components/ui/path-display';
import { inferType, InferredType } from '@/lib/type-inference';
import { ChevronRight, Folder, Clipboard, CornerRightDown } from 'lucide-react';
import { useTreeContext } from '@/components/data/tree-context';
import { useGridContext } from '@/components/data/grid-context';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface SearchResultProps {
  result: IndexItem;
  searchTerm: string;
  depth?: number;
  isDirectoryMatch?: boolean;
}

/**
  * Renders a search result
  * @param result - The search result to render
  * @param searchTerm - The search term
  * @param depth - The depth of the search result
  * @param isDirectoryMatch - Whether the search result is a directory match
  * @returns The search result component
*/
export const SearchResult: React.FC<SearchResultProps> = React.memo(({ result, searchTerm, depth = 0, isDirectoryMatch = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(isDirectoryMatch);
  const displayValue = result.data.value !== undefined ? String(result.data.value) : '';
  const valueType = inferType(result.data.value);

  const pathWithTypes: Array<{
    key: string;
    type: InferredType;
  }> = result.path.map((key, index) => ({
    key,
    type: index === result.path.length - 1 ? valueType : 'object'
  }));

  const hasNestedItems = valueType === 'object' || valueType === 'array';

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderValue = (value: JsonValue) => {
    if (value === undefined) return null;
    if (value === null) return <span className="text-muted-foreground">null</span>;
    if (value === 'Object') return null;
    if (value === 'Array') return null;

    return (
      <Highlight
        text={displayValue}
        searchTerm={searchTerm}
      />
    );
  };

  const { expandAndScrollToNode } = useTreeContext();
  const { scrollToRow, currentView } = useGridContext();


  const handleJumpTo = useCallback(() => {
    if (currentView === 'tree') {
      expandAndScrollToNode(result.path);
    } else if (result.originalIndex !== undefined) {
      scrollToRow(result.originalIndex);
    }
  }, [result, currentView, expandAndScrollToNode, scrollToRow]);

  const handleCopyToClipboard = useCallback((value: string) => {
    toast({
      title: 'Copied to clipboard',
      description: value,
    })
    navigator.clipboard.writeText(value);
  }, []);

  return (
    <div className={`group py-2 ${depth > 0 ? 'ml-4' : ''} ${isDirectoryMatch ? 'bg-secondary/20 p-2 rounded' : ''}`}>

      <div className="flex items-center whitespace-nowrap overflow-ellipsis">
        {(hasNestedItems || isDirectoryMatch) && (
          <button onClick={toggleExpand} className="mr-2 flex-shrink-0">
            {isExpanded ? <ChevronRight size={16} className="transform rotate-90" /> : <ChevronRight size={16} />}
          </button>
        )}

        {isDirectoryMatch && <Folder size={16} className="mr-2 text-primary flex-shrink-0" />}

        <PathDisplay
          path={pathWithTypes}
          searchTerm={searchTerm}
          className="overflow-hidden text-ellipsis"
        />

        {!hasNestedItems && (
          <>
            {result.data.value !== 'Object' && result.data.value !== 'Array' && (
              <p className="break-all overflow-ellipsis">
                <span className="text-muted-foreground">: </span>
                <span>{renderValue(result.data.value)}</span>
              </p>
            )}
          </>
        )}

        {/* Actions */}
        <div className='mx-4 space-x-2 absolute right-0'>
          <Button
            variant="outline"
            size="icon"
            onClick={handleJumpTo}
            className="group-hover:opacity-100 opacity-0"
            aria-label="Jump to item in tree view"
          >
            <CornerRightDown size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => { handleCopyToClipboard(displayValue) }}
            className="group-hover:opacity-100 opacity-0"
            aria-label="Copy item content"
          >
            <Clipboard size={16} />
          </Button>
        </div>
      </div>

      {hasNestedItems && isExpanded && (
        <div className="">
          {(result.children || []).map((child, index) => (
            <SearchResult
              key={`${result.id}-${child.data.key}-${index}`}
              result={child}
              searchTerm={searchTerm}
              depth={depth + 1}
              isDirectoryMatch={false}
            />
          ))}
        </div>
      )}
    </div>
  );
});

SearchResult.displayName = 'SearchResult';

export default SearchResult;
