import Fuse from 'fuse.js';
import { IndexItem, SearchResult } from '@/types';

const FUSE_THRESHOLD = 1000;

export const createSearchFunction = (data: IndexItem[]) => {
  if (!Array.isArray(data)) {
    console.error('Expected an array of IndexItem for search function, but received:', data);
    return () => [];
  }

  const flattenedData = flattenIndexItems(data);

  if (flattenedData.length < FUSE_THRESHOLD) {
    const fuse = new Fuse(flattenedData, {
      keys: ['data.key', 'data.value', 'flattenedPath'],
      includeMatches: true,
      includeScore: true,
    });

    return function search(term: string): SearchResult[] {
      if (!term.trim()) return [];
      const results = fuse.search(term);
      return results.map((result) => ({
        id: result.item.id,
        path: result.item.path,
        item: result.item,
        matches: result.matches || [],
        score: result.score || 0,
      }));
    };
  } else {
    return function search(term: string): SearchResult[] {
      if (!term.trim()) return [];
      const lowercaseTerm = term.toLowerCase();
      const filteredItems = flattenedData.filter(
        (item) =>
          (item.flattenedPath && item.flattenedPath.toLowerCase().includes(lowercaseTerm)) ||
          (item.data.value && String(item.data.value).toLowerCase().includes(lowercaseTerm))
      );
      return filteredItems.map((item) => ({
        id: item.id,
        path: item.path,
        item,
        matches: [], // No match info in this case
        score: 1,    // Assign a default score
      }));
    };
  }
};

function flattenIndexItems(items: IndexItem[]): IndexItem[] {
  if (!Array.isArray(items)) {
    console.error('Expected an array of IndexItem, but received:', items);
    return [];
  }

  const flattened: IndexItem[] = [];

  function flatten(item: IndexItem, parentPath: string[] = []) {
    const currentPath = [...parentPath, item.data.key];
    const flatItem: IndexItem = {
      ...item,
      path: currentPath,
      flattenedPath: currentPath.join(' > '),
    };
    flattened.push(flatItem);

    if (item.children && item.children.length > 0) {
      item.children.forEach((child) => flatten(child, currentPath));
    }
  }

  items.forEach((item) => flatten(item));
  return flattened;
}
