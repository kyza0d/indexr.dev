import React, { useCallback, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { TreeViewNode } from '@/tree/components';
import { useTreeContext } from '@/tree/provider';

export const Tree = () => {
  const {
    expandedNodes,
    toggleNode,
    highlightedNode,
    virtualListRef,
    setIsScrolling,
    flattenedData,
    nodeIndexMap,
    pendingScrollNodeId,
    setPendingScrollNodeId
  } = useTreeContext();

  // Handle scrolling when a node is highlighted
  useEffect(() => {
    if (pendingScrollNodeId && virtualListRef.current) {
      const index = nodeIndexMap.get(pendingScrollNodeId);
      if (typeof index === 'number') {
        virtualListRef.current.scrollToIndex({
          index,
          align: 'center',
          behavior: 'smooth'
        });
        // Clear the pending scroll after executing
        setPendingScrollNodeId(null);
      }
    }
  }, [pendingScrollNodeId, nodeIndexMap, virtualListRef, setPendingScrollNodeId]);



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
    <Virtuoso
      className="h-full"
      ref={virtualListRef}
      totalCount={flattenedData.length}
      itemContent={rowRenderer}
      isScrolling={(scrolling) => setIsScrolling(scrolling)}
      overscan={300}
      increaseViewportBy={{ top: 500, bottom: 500 }}
      data={flattenedData}
    />
  );
};
