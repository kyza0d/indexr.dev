import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import { useExplorerContext } from '@/explorer/provider';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const SearchInput = ({ className }: { className?: string }) => {
  const { searchTerm, setSearchTerm } = useExplorerContext()
  const { searchResults, totalItems } = useExplorerContext()

  return (
    <div className={cn("h-16 flex items-center", className)}>
      <div className="relative w-full">
        <Search size={20} className="absolute top-1/2 -translate-y-1/2 left-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-24"
        />
        {searchTerm.length > 1 && (
          <Badge variant="outline" className="absolute top-1/2 -translate-y-1/2 right-3 text-sm p-2 h-8 z-10">
            {searchResults.length} / {totalItems}
          </Badge>
        )}
      </div>
    </div>
  );
}
