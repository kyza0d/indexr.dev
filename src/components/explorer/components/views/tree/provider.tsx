import React, { createContext, useState, useContext, useCallback, useRef, useMemo, useEffect } from 'react';
import { VirtuosoHandle } from 'react-virtuoso';
import { IndexItem, TreeNode } from '@/types';
import { TreeContextType, TreeProviderProps } from '@/tree/types';
import { flattenTree } from './lib/utils';
import { InferredType } from '@/components/data/lib/infer-type';

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export function buildTreeData(data: IndexItem[]): TreeNode[] {
  const buildTreeNode = (item: IndexItem): TreeNode => ({
    key: item.data.key,
    type: item.type as InferredType,
    data: { value: item.data.value },
    children: item.children?.map(buildTreeNode),
    path: item.path.slice(1).map((p) => ({
      key: p,
      type: item.type as InferredType,
    })),
  });

  return data.flatMap((item) => item.children?.map(buildTreeNode) || []);
}

export const TreeProvider: React.FC<TreeProviderProps> = ({ children, data, currentView }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [nodeIndexMap, setNodeIndexMap] = useState<Map<string, number>>(new Map());
  const [pendingScrollNodeId, setPendingScrollNodeId] = useState<string | null>(null);
  const virtualListRef = useRef<VirtuosoHandle>(null);

  const treeData = useMemo(() => buildTreeData(data), [data]);

  const flattenedData = useMemo(() =>
    flattenTree(treeData, expandedNodes),
    [treeData, expandedNodes]
  );

  useEffect(() => {
    const indexMap = new Map<string, number>();
    flattenedData.forEach((node, index) => {
      indexMap.set(node.id, index);
    });
    setNodeIndexMap(indexMap);
  }, [flattenedData]);

  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandToNode = useCallback((nodePath: string[]) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      for (let i = 1; i <= nodePath.length; i++) {
        next.add(nodePath.slice(0, i).join('.'));
      }
      return next;
    });
  }, []);

  const scrollToNode = useCallback((nodeId: string) => {
    setPendingScrollNodeId(nodeId);
  }, []);

  const expandAndScrollToNode = useCallback((nodePath: string[]) => {
    if (virtualListRef.current) {
      const adjustedPath = nodePath.slice(1);
      const nodeId = adjustedPath.join('.');
      expandToNode(adjustedPath);
      setHighlightedNode(nodeId);
      scrollToNode(nodeId);
    } else {
      console.error('[TreeProvider] virtualListRef.current is null');
    }
  }, [expandToNode, scrollToNode]);

  return (
    <TreeContext.Provider value={{
      treeData,
      flattenedData,
      expandedNodes,
      toggleNode,
      expandToNode,
      scrollToNode,
      highlightedNode,
      setHighlightedNode,
      isScrolling,
      currentView,
      setIsScrolling,
      virtualListRef,
      nodeIndexMap,
      expandAndScrollToNode,
      pendingScrollNodeId,
      setPendingScrollNodeId
    }}>
      {children}
    </TreeContext.Provider>
  );
};

export const useTreeContext = () => {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error('useTreeContext must be used within a TreeProvider');
  }
  return context;
};
