import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { VirtuosoHandle } from 'react-virtuoso';

interface TreeContextType {
  expandedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;
  expandToNode: (nodePath: string[]) => void;
  scrollToNode: (nodeId: string) => void;
  highlightedNode: string | null;
  setHighlightedNode: (nodeId: string | null) => void;
  isScrolling: boolean;
  setIsScrolling: (isScrolling: boolean) => void;
  virtualListRef: React.RefObject<VirtuosoHandle>;
  currentView: 'tree' | 'grid';
  nodeIndexMap: Map<string, number>;
  setNodeIndexMap: React.Dispatch<React.SetStateAction<Map<string, number>>>;
  expandAndScrollToNode: (nodePath: string[]) => void;
  pendingScrollNodeId: string | null;
  setPendingScrollNodeId: React.Dispatch<React.SetStateAction<string | null>>;
}

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export const TreeProvider: React.FC<{ children: React.ReactNode, currentView: 'tree' | 'grid' }> = ({ children, currentView }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [nodeIndexMap, setNodeIndexMap] = useState<Map<string, number>>(new Map());
  const [pendingScrollNodeId, setPendingScrollNodeId] = useState<string | null>(null);
  const virtualListRef = useRef<VirtuosoHandle>(null);

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
    const adjustedPath = nodePath.slice(1);
    const nodeId = adjustedPath.join('.');
    expandToNode(adjustedPath);
    setHighlightedNode(nodeId);
    scrollToNode(nodeId);
  }, [expandToNode, setHighlightedNode, scrollToNode]);

  return (
    <TreeContext.Provider value={{
      expandedNodes,
      toggleNode,
      expandToNode,
      scrollToNode,
      highlightedNode,
      setHighlightedNode,
      isScrolling,
      setIsScrolling,
      virtualListRef,
      nodeIndexMap,
      setNodeIndexMap,
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
