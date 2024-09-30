'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useDataExplorer } from '@/hooks/use-data-explorer'
import { useRecordView } from '@/hooks/use-record-view'

import { FileIcon, FolderSearch, AlertCircle, Table, Search } from 'lucide-react'
import { Virtuoso } from 'react-virtuoso'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

import { TreeView } from '@/components/data/tree-view'
import { GridView } from '@/components/data/grid-view'
import { SearchBar } from '@/components/search/search-bar'
import { SearchResult } from '@/components/search/search-result'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { RawDataModal } from '@/components/data/raw-data-modal'
import { DataExplorerSkeleton } from '@/components/data/explorer-skeleton'
import { SaveDatasetButton } from '@/components/dataset/save-button'

import { TreeProvider } from './tree-context'
import { GridProvider } from './grid-context'

import { Dataset, IndexItem } from '@/types'

interface DataExplorerProps {
  initialDataset: Dataset
}

export function DataExplorer({ initialDataset }: DataExplorerProps) {
  const { data: session, status } = useSession()
  const [showRawData, setShowRawData] = useState<boolean>(false)
  const [currentView, setCurrentView] = useState<'tree' | 'grid'>('tree')
  const [dataset, setDataset] = useState<Dataset>(initialDataset)

  const {
    isLoading,
    error,
    treeData,
    gridData,
    searchTerm,
    setSearchTerm,
    searchResults,
    totalItems,
  } = useDataExplorer(dataset)

  useRecordView(dataset.id, status)

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [setSearchTerm])

  const handleSaveToggle = useCallback(async (isSaved: boolean) => {
    try {
      const response = await fetch('/api/datasets/save', {
        method: isSaved ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasetId: dataset.id }),
      })

      if (!response.ok) {
        throw new Error('Failed to update saved status')
      }

      setDataset(prevDataset => ({ ...prevDataset, isSaved }))
    } catch (error) {
      console.error('Error updating saved status:', error)
    }
  }, [dataset.id, setDataset])

  const refetchDataset = useCallback(async () => {
    try {
      const response = await fetch(`/api/datasets/${dataset.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch updated dataset')
      }
      const updatedDataset = await response.json()
      setDataset(updatedDataset)
    } catch (error) {
      console.error('Error fetching updated dataset:', error)
    }
  }, [dataset.id, setDataset])

  useEffect(() => {
    refetchDataset()
  }, [refetchDataset])

  const ItemRenderer = useCallback(
    ({ item, index }: { item: IndexItem; index: number }) => (
      <SearchResult key={index} result={item} searchTerm={searchTerm} />
    ),
    [searchTerm]
  )

  if (isLoading) return <DataExplorerSkeleton />

  if (error) return <ErrorDisplay error={error} />

  const isOwner = session?.user?.id === dataset.userId

  return (
    <TreeProvider currentView={currentView}>
      <GridProvider currentView={currentView}>
        <div className="flex flex-col h-[86vh]">
          <PanelGroup direction="horizontal" className="flex-grow relative">
            <DatasetHeader
              dataset={dataset}
              isOwner={isOwner}
              searchTerm={searchTerm}
              onSearch={handleSearch}
              searchResults={searchResults}
              totalItems={totalItems}
            />
            <Panel className="pt-12">
              <DataTabs
                dataset={dataset}
                currentView={currentView}
                setCurrentView={setCurrentView}
                setShowRawData={setShowRawData}
                treeData={treeData}
                gridData={gridData}
                searchTerm={searchTerm}
                isOwner={isOwner}
                onSaveToggle={handleSaveToggle}
              />
            </Panel>
            {searchTerm && (
              <SearchResultsPanel
                searchResults={searchResults}
                ItemRenderer={ItemRenderer}
                fileType={dataset.fileType}
              />
            )}
          </PanelGroup>
        </div>
        <RawDataModal
          isOpen={showRawData}
          onClose={() => setShowRawData(false)}
          datasetId={dataset.id}
          datasetName={dataset.name}
          datasetDescription={dataset.description || undefined}
          fileType={dataset.fileType}
        />
      </GridProvider>
    </TreeProvider>
  )
}

interface ErrorDisplayProps {
  error: string
}

function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Error Loading Dataset</h2>
      <p className="text-center mb-4">{error}</p>
      <p className="text-center text-sm text-gray-500">
        This could be due to a missing file or insufficient permissions.
        Please check the dataset configuration or contact support.
      </p>
    </div>
  )
}

interface DatasetHeaderProps {
  dataset: Dataset
  isOwner: boolean
  searchTerm: string
  onSearch: (term: string) => void
  searchResults: IndexItem[]
  totalItems: number
}

function DatasetHeader({
  dataset,
  isOwner,
  searchTerm,
  onSearch,
  searchResults,
  totalItems,
}: DatasetHeaderProps) {
  return (
    <div className="absolute w-full">
      <div className="flex items-center justify-end space-x-2">
        <div className="flex items-center space-x-2">
          {dataset.isPublic && <span className="text-green-500">Public</span>}
          {isOwner && <span className="text-blue-500">Owner</span>}
        </div>
        <SearchBar value={searchTerm} onChange={onSearch} />
        {searchResults.length > 0 && (
          <div className="absolute text-sm text-muted-foreground p-2 px-4">
            {searchResults.length} / {totalItems}
          </div>
        )}
      </div>
    </div>
  )
}

interface DataTabsProps {
  dataset: Dataset
  currentView: 'tree' | 'grid'
  setCurrentView: React.Dispatch<React.SetStateAction<'tree' | 'grid'>>
  setShowRawData: (show: boolean) => void
  treeData: any
  gridData: any
  searchTerm: string
  isOwner: boolean
  onSaveToggle: (isSaved: boolean) => Promise<void>
}

function DataTabs({
  dataset,
  currentView,
  setCurrentView,
  setShowRawData,
  treeData,
  gridData,
  searchTerm,
  isOwner,
  onSaveToggle,
}: DataTabsProps) {
  return (
    <Tabs
      defaultValue="tree"
      className="flex h-full flex-col relative"
      onValueChange={(value) => setCurrentView(value as 'tree' | 'grid')}
    >
      <div className="absolute top-0 left-0 -translate-y-full space-x-2 mt-[1px]">
        <Button
          onClick={() => setShowRawData(true)}
          className="self-start"
          variant="outline"
          aria-label="Show Raw Data"
        >
          <FileIcon className="mr-2 h-4 w-4" />
          {dataset.name.split('.').pop() || 'Dataset'}
        </Button>
        <TabsList>
          <TabsTrigger value="tree">
            <FolderSearch size={16} className="mr-2" />
            Tree View
          </TabsTrigger>
          {dataset.fileType !== 'application/json' && (
            <TabsTrigger value="grid">
              <Table size={16} className="mr-2" />
              Grid View
            </TabsTrigger>
          )}
        </TabsList>
        {!isOwner && dataset.isPublic && (
          <SaveDatasetButton
            datasetId={dataset.id}
            isSaved={dataset.isSaved}
            onSaveToggle={onSaveToggle}
          />
        )}
      </div>
      <TabsContent value="tree" className="flex-grow mt-2">
        <AutoSizer>
          {({ height, width }) => (
            <div
              style={{ height, width }}
              className="rounded-lg border bg-background overflow-hidden"
            >
              <TreeView data={treeData} />
            </div>
          )}
        </AutoSizer>
      </TabsContent>
      <TabsContent value="grid" className="flex-grow mt-2">
        <AutoSizer>
          {({ height, width }) => (
            <div
              style={{ height, width }}
              className="rounded-lg border overflow-hidden"
            >
              <GridView data={gridData} />
            </div>
          )}
        </AutoSizer>
      </TabsContent>
    </Tabs>
  )
}

interface SearchResultsPanelProps {
  searchResults: IndexItem[]
  ItemRenderer: React.ComponentType<{ item: IndexItem; index: number }>
  fileType: string
}

function SearchResultsPanel({
  searchResults,
  ItemRenderer,
  fileType,
}: SearchResultsPanelProps) {
  return (
    <>
      <PanelResizeHandle className="group relative hover:cursor-ew-resize before:content-[''] before:absolute before:inset-0 before:z-10 before:bg-neutral-500  dark:before:bg-neutral-800 before:h-full before:mx-auto before:w-[1px] before:hover:w-1 hover:before:bg-neutral-700 mt-14 mx-2 w-0.5 before:rounded-md before:transition-colors" />
      <Panel className="pt-12" defaultSize={40} minSize={20}>
        <div className="h-full flex flex-col">
          <div className="flex-grow mt-2 border rounded-lg overflow-hidden">
            {searchResults.length > 0 ? (
              <AutoSizer>
                {({ width }) => (
                  <Virtuoso
                    style={{ width, height: '83vh', padding: '0 0.5rem' }}
                    className="bg-background"
                    overscan={200}
                    totalCount={searchResults.length}
                    itemContent={(index) => (
                      <ItemRenderer
                        item={{
                          ...searchResults[index],
                          currentIndex: index,
                        }}
                        index={index}
                      />
                    )}
                  />
                )}
              </AutoSizer>
            ) : (
              <div className="w-full h-full grid items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Search size={18} className="text-muted-foreground" />
                  <p className="text-center text-sm text-muted-foreground">
                    No results found
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </>
  )
}

export default DataExplorer
