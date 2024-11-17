"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { Dataset, IndexItem, SearchResult } from '@/types'
import { fetchDataset } from '@/dataset/actions/fetch'
import { countTotalItems } from '@/dataset/actions/fetch-stats'
import { createSearchFunction } from '@/search/lib/utils'

interface ExplorerContextType {
  data: IndexItem[];
  dataset: Dataset | null;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchResult[];
  totalItems: number;
  hasDataset: boolean;
  currentView: 'tree' | 'grid';
  setCurrentView: (view: 'tree' | 'grid') => void;
}

interface ExplorerProviderProps {
  children: React.ReactNode
  dataset_id?: Dataset | any
  inlineData?: IndexItem[]
  currentView?: 'tree' | 'grid'
  setCurrentView?: (view: 'tree' | 'grid') => void
}

const ExplorerContext = createContext<ExplorerContextType | undefined>(undefined)

export function ExplorerProvider({
  children,
  dataset_id: dataset,
  inlineData,
  currentView: externalView = 'tree',
  setCurrentView: externalSetView,
}: ExplorerProviderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<IndexItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [totalItems, setTotalItems] = useState(0)
  const [internalView, setInternalView] = useState<'tree' | 'grid'>(externalView);
  const [currentDataset, setCurrentDataset] = useState<Dataset | null>(dataset || null)

  console.log('[ExplorerProvider] Rendering with:', {
    externalView,
    internalView,
    hasExternalSetView: !!externalSetView,
    dataset: currentDataset
  })

  const currentView = externalSetView ? externalView : internalView;

  const setCurrentView = useCallback((view: 'tree' | 'grid') => {
    console.log('[ExplorerProvider] setCurrentView called with:', view)
    if (externalSetView) {
      console.log('[ExplorerProvider] Using external setCurrentView')
      externalSetView(view)
    } else {
      console.log('[ExplorerProvider] Using internal setCurrentView')
      setInternalView(view)
    }
  }, [externalSetView])

  const hasDataset = Boolean(dataset || inlineData)

  // Handle inline data
  useEffect(() => {
    if (inlineData) {
      setData(inlineData)
      setTotalItems(countTotalItems(inlineData))
      setIsLoading(false)
      setError(null)
    }
  }, [inlineData])

  // Handle dataset fetching and updating
  useEffect(() => {
    if (dataset) {
      setCurrentDataset(dataset)
    }
  }, [dataset])

  const handleFetchData = useCallback(() => {
    if (!currentDataset || inlineData) return

    fetchDataset({
      dataset: currentDataset,
      onStart: () => {
        setIsLoading(true)
        setError(null)
      },
      onComplete: (normalizedData) => {
        setData(normalizedData)
        setTotalItems(countTotalItems(normalizedData))
        setIsLoading(false)
      },
      onError: (err) => {
        console.error('Error fetching data:', err)
        setError(err.message)
        setIsLoading(false)
        setData([])
        setTotalItems(0)
      }
    })
  }, [currentDataset, inlineData])

  useEffect(() => {
    handleFetchData()
  }, [handleFetchData])

  useEffect(() => {
    handleFetchData()
  }, [handleFetchData])

  const fetchAndUpdateDataset = async (datasetId: string) => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dataset');
      }
      const data = await response.json();
      setCurrentDataset(data);
    } catch (error) {
      console.error('Error fetching dataset:', error);
      setError('Failed to fetch dataset details');
    }
  };

  // Update the useEffect that handles dataset updates:
  useEffect(() => {
    if (dataset?.id) {
      fetchAndUpdateDataset(dataset.id);
    } else if (dataset) {
      setCurrentDataset(dataset);
    }
  }, [dataset]);

  const searchFunction = useMemo(() => createSearchFunction(data), [data])

  // Inside ExplorerProvider

  const idToOriginalIndexMap = useMemo(() => {
    const map = new Map<string, number>();

    function traverse(item: IndexItem, originalIndex: number | undefined) {
      // Map the item's ID to the originalIndex of its top-level parent
      if (originalIndex !== undefined) {
        map.set(item.id, originalIndex);
      }

      if (item.children) {
        item.children.forEach(child => {
          traverse(child, originalIndex);
        });
      }
    }

    if (data.length === 1 && data[0].type === 'array' && data[0].children) {
      data[0].children.forEach((item, index) => {
        // Each item here corresponds to a row in the grid data
        traverse(item, index);
      });
    }

    console.log('[ExplorerProvider] idToOriginalIndexMap:', Array.from(map.entries()));
    return map;
  }, [data]);

  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length <= 1 || !hasDataset) return [];

    const results = searchFunction(searchTerm);
    return results.map((result) => {
      const itemId = result.item.id;
      const originalIndex = idToOriginalIndexMap.get(itemId);

      // Log the originalIndex for debugging
      console.log('[ExplorerProvider] Assigning originalIndex:', originalIndex, 'to itemId:', itemId);

      // Set originalIndex on both result and result.item
      const updatedResult = {
        ...result,
        originalIndex,
        item: {
          ...result.item,
          originalIndex,
        },
      };

      return updatedResult;
    });
  }, [searchFunction, searchTerm, hasDataset, idToOriginalIndexMap]);

  const value = {
    data,
    dataset: currentDataset,  // Expose dataset in context
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    searchResults,
    totalItems,
    hasDataset,
    currentView,
    setCurrentView,
  }

  console.log('[ExplorerProvider] Provider value:', {
    currentView: value.currentView,
    hasDataset: value.hasDataset,
  });

  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  )
}

export function useExplorerContext() {
  const context = useContext(ExplorerContext)
  if (context === undefined) {
    throw new Error('useExplorer must be used within an ExplorerProvider')
  }
  return context
}
