import { TreeNode } from '@/types';
import { FlattenedTreeNode } from '@/tree/types';
import { JsonValue } from '@/types';

export function flattenTree(
  nodes: TreeNode[],
  expandedNodes: Set<string>,
  depth = 0,
  path: string[] = []
): FlattenedTreeNode[] {
  const result: FlattenedTreeNode[] = [];

  for (const node of nodes) {
    const currentPath = [...path, node.key];
    const id = currentPath.join('.');

    const flattenedNode: FlattenedTreeNode = {
      id,
      depth,
      path: currentPath,
      node,
      rawData: node.data.value as JsonValue | string,
      type: node.type,
      key: node.key,
      data: {
        key: node.key,
        value: node.data.value,
      },
    };

    result.push(flattenedNode);

    if (node.children && expandedNodes.has(id)) {
      result.push(...flattenTree(node.children, expandedNodes, depth + 1, currentPath));
    }
  }

  return result;
}
