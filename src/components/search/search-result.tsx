import React, { useCallback } from 'react';
import { IndexItem, JsonValue } from '@/types';
import { Highlight } from '@/components/ui/highlight';
import { PathDisplay } from '@/components/ui/path-display';
import { inferType, InferredType } from '@/lib/type-inference';
import { ChevronRight, Folder } from 'lucide-react';
import { useTreeContext } from '@/components/data/tree-context';
import { useGridContext } from '@/components/data/grid-context';
import { Button } from '@/components/ui/button';

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

  return (
    <div className={`group flex flex-col py-1.5 ${depth > 0 ? 'ml-4' : ''} ${isDirectoryMatch ? 'bg-secondary/20 p-2 rounded' : ''}`}>
      <div className="flex items-center">
        {(hasNestedItems || isDirectoryMatch) && (
          <button onClick={toggleExpand} className="mr-2">
            {isExpanded ? <ChevronRight size={16} className="transform rotate-90" /> : <ChevronRight size={16} />}
          </button>
        )}
        {isDirectoryMatch && <Folder size={16} className="mr-2 text-primary" />}
        <PathDisplay
          path={pathWithTypes}
          searchTerm={searchTerm}
        />
        {!hasNestedItems && (
          <>
            {result.data.value !== 'Object' && result.data.value !== 'Array' && (
              <span>
                <span className="text-muted-foreground">: </span>
                {renderValue(result.data.value)}
              </span>
            )}
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleJumpTo}
          className="group-hover:opacity-100 opacity-0 mx-2"
          aria-label="Jump to item in tree view"
        >
          <ChevronRight size={16} />
        </Button>
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
