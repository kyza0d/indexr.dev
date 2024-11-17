import React from 'react';
import { SearchResult } from '@/components/search/components/result';
import { useExplorerContext } from '@/explorer/provider';
import { Virtuoso } from 'react-virtuoso';
import { Search } from 'lucide-react';

export function SearchResults() {
  const { searchResults, searchTerm } = useExplorerContext();

  return (
    <div className="h-full flex flex-col">
      {searchResults.length > 0 ? (
        <Virtuoso
          overscan={200}
          totalCount={searchResults.length}
          className="h-full"
          itemContent={(index) => (
            <SearchResult
              key={`${searchResults[index].id}-${index}`}
              result={searchResults[index]}
              searchTerm={searchTerm}
            />
          )}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <Search size={18} className="text-muted-foreground" />
          <p className="text-center text-sm text-muted-foreground ml-2">
            {searchTerm.length > 1 ? 'No results found' : 'Type to search...'}
          </p>
        </div>
      )}
    </div>
  );
}
