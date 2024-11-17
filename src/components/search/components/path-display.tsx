import React from 'react';
import { ChevronRight } from 'lucide-react';

import { InferredType } from '@/data/lib/infer-type';
import { Icon as TypeIcon } from '@/components/layout/icons';

import { Highlight } from '@/components/ui/highlight';

interface PathDisplayProps {
  path: Array<{ key: string; type: InferredType }>;
  searchTerm: string;
}

export const PathDisplay: React.FC<PathDisplayProps> = ({ path, searchTerm }) => {
  const displayPath = path.slice(1);

  return (
    <div className="flex items-center space-x-1 text-sm  pt-1">
      {displayPath.map(({ key, type }, index) => {
        const { icon: Icon, className } = TypeIcon(type);
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={12} className="flex-shrink-0" />}
            <div className="flex items-center flex-shrink-0">
              <Icon size={22} className={className} />
              <span className="ml-1 truncate text-muted-foreground">
                <Highlight text={key} searchTerm={searchTerm} />
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
