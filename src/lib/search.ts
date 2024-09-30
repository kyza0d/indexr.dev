import Fuse from 'fuse.js';
import { IndexItem, Dataset } from '@/types';

function flattenIndexItems(items: IndexItem[]): IndexItem[] {
  const flattened: IndexItem[] = [];

  function flatten(item: IndexItem, parentPath: string[] = []) {
    const currentPath = [...parentPath, item.data.key];
    const flatItem: IndexItem = {
      ...item,
      path: currentPath,
      flattenedPath: currentPath.join(' > '),
    };
    flattened.push(flatItem);

    if (item.children) {
      item.children.forEach(child => flatten(child, currentPath));
    }
  }

  items.forEach(item => flatten(item));
  return flattened;
}

const FUSE_THRESHOLD = 1000; // Adjust this value based on your performance tests

export function createSearchFunction(data: IndexItem[]) {
  const flattenedData = flattenIndexItems(data);

  if (flattenedData.length < FUSE_THRESHOLD) {
    const fuse = new Fuse(flattenedData, {
      keys: ['data.key', 'data.value', 'flattenedPath'],
      includeMatches: true,
      threshold: 0.4,
      ignoreLocation: true,
      useExtendedSearch: true,
    });

    return function search(term: string): IndexItem[] {
      if (!term.trim()) return [];
      const results = fuse.search(term);
      return results.map(result => result.item);
    };
  } else {
    // Use a simple string matching for larger datasets
    return function search(term: string): IndexItem[] {
      if (!term.trim()) return [];
      const lowercaseTerm = term.toLowerCase();
      return flattenedData.filter(item =>
        (item.flattenedPath && item.flattenedPath.toLowerCase().includes(lowercaseTerm)) ||
        (item.data.value && String(item.data.value).toLowerCase().includes(lowercaseTerm))
      );
    };
  }
}

export function searchDatasets(datasets: Dataset[], query: string): Dataset[] {
  if (!query) return datasets;

  const options = {
    keys: ['name', 'description'], // Replace with actual Dataset properties
    threshold: 0.4,
    includeMatches: true,
    ignoreLocation: true,
    useExtendedSearch: true,
  };

  const fuse = new Fuse(datasets, options);
  return fuse.search(query).map(result => result.item);
}
