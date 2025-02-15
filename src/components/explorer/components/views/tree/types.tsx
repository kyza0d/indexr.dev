import { JsonValue, TreeNode } from '@/types';
import { VirtuosoHandle } from 'react-virtuoso';
import { IndexItem } from '@/types';
import { InferredType } from '@/components/data/lib/infer-type';

export interface FlattenedTreeNode extends IndexItem {
  key: string;
  id: string;
  node: TreeNode;
  depth: number;
  rawData: InferredType | JsonValue | string;
  children?: IndexItem[];
  data: {
    key: string;
    value: JsonValue;
  }
}

export interface TreeViewNodeProps {
  node: FlattenedTreeNode;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  isHighlighted: boolean;
}

export interface TreeContextType {
  treeData: any;
  flattenedData: FlattenedTreeNode[];
  expandedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;
  expandToNode: (nodePath: string[]) => void;
  scrollToNode: (nodeId: string) => void;
  highlightedNode: string | null;
  setHighlightedNode: (nodeId: string | null) => void;
  isScrolling: boolean;
  setIsScrolling: (isScrolling: boolean) => void;
  virtualListRef: React.RefObject<VirtuosoHandle | null>;
  currentView: 'tree' | 'grid';
  nodeIndexMap: Map<string, number>;
  expandAndScrollToNode: (nodePath: string[]) => void;
  pendingScrollNodeId: string | null;
  setPendingScrollNodeId: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface TreeProviderProps {
  children: React.ReactNode;
  currentView: 'tree' | 'grid';
  data: IndexItem[];
}

