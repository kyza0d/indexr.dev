import React, { useCallback } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Icon as IconType } from '@/components/layout/icons';
import { TreeViewNodeProps } from '@/tree/types';

export const TreeViewNode: React.FC<TreeViewNodeProps> = React.memo(({
  node,
  isExpanded,
  onToggle,
  isHighlighted
}) => {
  const { icon: Icon, className } = IconType(node.type);

  console.log('TreeViewNode node:', node); // Debugging
  const hasChildren = node.node && node.node.children && node.node.children.length > 0;

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(node.id);
  }, [onToggle, node.id]);

  return (
    <div
      style={{ paddingLeft: `${node.depth * 20}px` }}
      onClick={handleToggle}
      className={`
        group flex py-2 space-x-2 rounded-md mx-2
        ${isHighlighted ? 'bg-primary/80' : 'hover:bg-accent/50'} 
        ${hasChildren ? 'cursor-pointer' : ''}
        transition-colors duration-300 
        min-w-0 
      `}
    >
      {/* Chevron/Spacer Column */}
      <div className="flex-shrink-0 pl-9 pt-1">
        {hasChildren ? (
          <>
            <span className="rounded-sm flex-shrink-0">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </>
        ) : (
          <span className="w-6 flex-shrink-0" />
        )}
      </div>

      {/* Icon Column */}
      <div className="flex-shrink-0 pt-0.5 align-middle absolute">
        <Icon size={22} className={`flex-shrink-0 ${className}`} />
      </div>

      {/* Content Column */}
      <div className="flex-1 overflow-hidden min-w-0">
        <div className="flex items-baseline gap-x-1 min-w-0">
          <span className="font-medium truncate">
            {node.key}
          </span>
          {node.data.value !== 'Object' && node.data.value !== 'Array' && (
            <>
              <span className="text-muted-foreground flex-shrink-0">:</span>
              <span className="text-muted-foreground truncate">
                {String(node.data.value)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

TreeViewNode.displayName = 'TreeViewNode';

export default TreeViewNode;
