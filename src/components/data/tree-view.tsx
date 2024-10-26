import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { TreeNode } from '@/types';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { getIcon } from '@/lib/type-icon';
import { useTreeContext } from './tree-context';

interface TreeViewProps {
  data: TreeNode[];
}

export const TreeView: React.FC<TreeViewProps> = ({ data }) => {
  const {
    expandedNodes,
    toggleNode,
    highlightedNode,
    virtualListRef,
    setNodeIndexMap,
    setIsScrolling,
    pendingScrollNodeId,
    setPendingScrollNodeId
  } = useTreeContext();

  const [followOutput, setFollowOutput] = useState(false);
  const flattenedData = useMemo(() => flattenTree(data, expandedNodes), [data, expandedNodes]);

  useEffect(() => {
    const indexMap = new Map<string, number>();
    flattenedData.forEach((node, index) => {
      indexMap.set(node.id, index);
    });
    setNodeIndexMap(indexMap);
  }, [flattenedData, setNodeIndexMap]);

  useEffect(() => {
    if (pendingScrollNodeId) {
      const index = flattenedData.findIndex(node => node.id === pendingScrollNodeId);
      if (index !== -1) {
        setFollowOutput(true);
        // Add a small delay before scrolling
        setTimeout(() => {
          virtualListRef.current?.scrollToIndex({ index, align: 'center', behavior: 'smooth', });
        }, 50);
      }
      setPendingScrollNodeId(null);
    }
  }, [pendingScrollNodeId, flattenedData, virtualListRef, setPendingScrollNodeId]);

  const rowRenderer = useCallback(
    (index: number) => {
      const node = flattenedData[index];
      if (!node) return null;
      return (
        <TreeViewNode
          key={node.id}
          node={node}
          isExpanded={expandedNodes.has(node.id)}
          onToggle={toggleNode}
          isHighlighted={node.id === highlightedNode}
        />
      );
    },
    [flattenedData, expandedNodes, toggleNode, highlightedNode]
  );

  return (
    <Virtuoso<FlattenedTreeNode>
      ref={virtualListRef as React.RefObject<VirtuosoHandle>}
      totalCount={flattenedData.length}
      itemContent={rowRenderer}
      followOutput={followOutput}
      isScrolling={(scrolling) => setIsScrolling(scrolling)}
      overscan={300}
      increaseViewportBy={{ top: 500, bottom: 500 }}
      data={flattenedData}
    />
  );
};

interface TreeViewNodeProps {
  node: FlattenedTreeNode;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  isHighlighted: boolean;
}

const TreeViewNode: React.FC<TreeViewNodeProps> = React.memo(
  ({ node, isExpanded, onToggle, isHighlighted }) => {
    const { icon: Icon, className } = getIcon(node.type);
    const hasChildren = node.children && node.children.length > 0;

    const handleToggle = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onToggle(node.id);
    }, [onToggle, node.id]);

    return (
      <div
        style={{ paddingLeft: `${node.depth * 20}px` }}
        className={`flex items-center p-2 rounded-md mx-2 ${isHighlighted ? 'bg-primary' : ''} transition-colors duration-300`}
      >
        {hasChildren ? (
          <button onClick={handleToggle} className="p-1 hover:bg-accent rounded-sm">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="w-6" />
        )}
        <Icon size={22} className={`mr-2 ${className}`} />
        <span className="font-medium">{node.key}</span>
        {node.data.value !== 'Object' && node.data.value !== 'Array' && (
          <span>
            <span className="text-muted-foreground">: </span>
            {String(node.data.value)}
          </span>
        )}
      </div>
    );
  }
);

TreeViewNode.displayName = 'TreeViewNode';

interface FlattenedTreeNode extends TreeNode {
  id: string;
  depth: number;
}

function flattenTree(nodes: TreeNode[], expandedNodes: Set<string>, depth = 0, path: string[] = []): FlattenedTreeNode[] {
  const result: FlattenedTreeNode[] = [];

  for (const node of nodes) {
    const currentPath = [...path, node.key];
    const id = currentPath.join('.');
    result.push({ ...node, id, depth });

    if (node.children && expandedNodes.has(id)) {
      result.push(...flattenTree(node.children, expandedNodes, depth + 1, currentPath));
    }
  }

  return result;
}

export default TreeView;
