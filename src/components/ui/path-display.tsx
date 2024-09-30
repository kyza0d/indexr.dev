import React from 'react';
import { ChevronRight, FileIcon, FolderIcon } from 'lucide-react';
import { InferredType } from '@/lib/type-inference';
import { Highlight } from '@/components/ui/highlight';
import { getIcon } from '@/lib/type-icon';

interface PathDisplayProps {
  path: Array<{ key: string; type: InferredType }>;
  searchTerm: string;
}

export const PathDisplay: React.FC<PathDisplayProps> = ({ path, searchTerm }) => {
  const displayPath = path.slice(1);

  return (
    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
      {displayPath.map(({ key, type }, index) => {
        const { icon: Icon, className } = getIcon(type);
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={12} className="text-muted-foreground flex-shrink-0" />}
            <div className="flex items-center flex-shrink-0">
              <Icon size={22} className={className} />
              <span className="ml-1 truncate">
                <Highlight text={key} searchTerm={searchTerm} />
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
