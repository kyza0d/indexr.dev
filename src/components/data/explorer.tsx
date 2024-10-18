'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useDataExplorer } from '@/hooks/use-data-explorer'
import { useRecordView } from '@/hooks/use-record-view'

import {
  FileIcon,
  FolderSearch,
  AlertCircle,
  Table,
  Search,
  Menu as MenuIcon,
} from 'lucide-react'
import { Virtuoso } from 'react-virtuoso'
import AutoSizer from 'react-virtualized-auto-sizer'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useMediaQuery } from 'react-responsive'

import { TreeView } from '@/components/data/tree-view'
import GridView from '@/components/data/grid-view'
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

// Import UI components for the Sheet (context menu)
import {
  Sheet,
  SheetTrigger,
  SheetContent,
} from '@/components/ui/sheet'

interface DataExplorerProps {
  initialDataset: Dataset
}

export function DataExplorer({ initialDataset }: DataExplorerProps) {
  const { data: session, status } = useSession()
  const [showRawData, setShowRawData] = useState<boolean>(false)
  const [currentView, setCurrentView] = useState<'tree' | 'grid'>('tree')
  const [dataset, setDataset] = useState<Dataset>(initialDataset)

  const isSmallScreen = useMediaQuery({ query: '(max-width: 1120px)' })

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

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term.length > 1 ? term : '');
    },
    [setSearchTerm]
  );

  const handleSaveToggle = useCallback(
    async (isSaved: boolean) => {
      try {
        const response = await fetch('/api/datasets/save', {
          method: isSaved ? 'POST' : 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ datasetId: dataset.id }),
        })

        if (!response.ok) {
          throw new Error('Failed to update saved status')
        }

        setDataset((prevDataset) => ({ ...prevDataset, isSaved }))
      } catch (error) {
        console.error('Error updating saved status:', error)
      }
    },
    [dataset.id, setDataset]
  )

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
        <div className="flex flex-col h-[96vh]">
          <PanelGroup
            direction={isSmallScreen ? 'vertical' : 'horizontal'}
            className="flex-grow relative"
          >
            {isSmallScreen ? (
              <>
                <MobileMenu
                  dataset={dataset}
                  isOwner={isOwner}
                  searchTerm={searchTerm}
                  onSearch={handleSearch}
                  searchResults={searchResults}
                  totalItems={totalItems}
                  currentView={currentView}
                  setCurrentView={setCurrentView}
                  setShowRawData={setShowRawData}
                  onSaveToggle={handleSaveToggle}
                />
                <Panel className="mt-2 flex-grow rounded-lg border ">
                  {currentView === 'tree' ? (
                    <TreeView data={treeData} />
                  ) : (
                    <GridView data={gridData} />
                  )}
                </Panel>
                {searchTerm && (
                  <>
                    <PanelResizeHandle className="bg-neutral-700 h-[1px] mt-2 " />
                    <Panel defaultSize={40} minSize={20}>
                      <SearchResultsPanel
                        searchResults={searchResults}
                        ItemRenderer={ItemRenderer}
                        fileType={dataset.fileType}
                      />
                    </Panel>
                  </>
                )}
              </>
            ) : (
              <>
                <DatasetHeader
                  dataset={dataset}
                  isOwner={isOwner}
                  searchTerm={searchTerm}
                  onSearch={handleSearch}
                  searchResults={searchResults}
                  totalItems={totalItems}
                  isSmallScreen={isSmallScreen}
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
                    isSmallScreen={isSmallScreen}
                  />
                </Panel>
                {searchTerm && (
                  <>
                    <PanelResizeHandle className="bg-neutral-700 w-[1px] h-full mt-12 mx-2 pt-12" />
                    <Panel defaultSize={40} minSize={20} className="pt-12">
                      <SearchResultsPanel
                        searchResults={searchResults}
                        ItemRenderer={ItemRenderer}
                        fileType={dataset.fileType}
                      />
                    </Panel>
                  </>
                )}
              </>
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
  isSmallScreen: boolean
}

function DatasetHeader({
  isOwner,
  searchTerm,
  onSearch,
  searchResults,
  totalItems,
  isSmallScreen,
}: DatasetHeaderProps) {
  return (
    <div className={`absolute right-0`}>
      <div
        className={`flex items-center ${isSmallScreen ? 'justify-between' : 'justify-end'
          } space-x-2`}
      >
        {!isSmallScreen && (
          <div className="flex items-center space-x-2">
            {isOwner && <span className="text-blue-500">Owner</span>}
          </div>
        )}
        <SearchBar
          value={searchTerm}
          onChange={onSearch}
          isSmallScreen={isSmallScreen}
        />
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
  isSmallScreen: boolean
}

function DataTabs({
  dataset,
  setCurrentView,
  setShowRawData,
  treeData,
  gridData,
  isOwner,
  onSaveToggle,
}: DataTabsProps) {
  return (
    <Tabs
      defaultValue="tree"
      className="flex h-full flex-col relative"
      onValueChange={(value) => setCurrentView(value as 'tree' | 'grid')}
    >
      <div className='absolute top-0 left-0 -translate-y-full mt-[1px] space-x-2' >
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

interface MobileMenuProps {
  dataset: Dataset
  isOwner: boolean
  searchTerm: string
  onSearch: (term: string) => void
  searchResults: IndexItem[]
  totalItems: number
  currentView: 'tree' | 'grid'
  setCurrentView: React.Dispatch<React.SetStateAction<'tree' | 'grid'>>
  setShowRawData: (show: boolean) => void
  onSaveToggle: (isSaved: boolean) => Promise<void>
}

function MobileMenu({
  dataset,
  isOwner,
  searchTerm,
  onSearch,
  currentView,
  setCurrentView,
  setShowRawData,
  onSaveToggle,
}: MobileMenuProps) {
  return (
    <div className="w-full mt-4 flex items-center">
      <SearchBar value={searchTerm} onChange={onSearch} />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="ml-2" aria-label="Menu">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <div className="mt-6">
            <div className='flex space-x-2'>
              <Button
                onClick={() => setShowRawData(true)}
                className="w-full mb-2"
                variant="outline"
                aria-label="Show Raw Data"
              >
                <FileIcon className="mr-2 h-4 w-4" />
                {dataset.name.split('.').pop() || 'Dataset'}
              </Button>
              {!isOwner && dataset.isPublic && (
                <SaveDatasetButton
                  datasetId={dataset.id}
                  isSaved={dataset.isSaved}
                  onSaveToggle={onSaveToggle}
                />
              )}
            </div>
            <Tabs
              defaultValue={currentView}
              className="flex flex-col"
              onValueChange={(value) => setCurrentView(value as 'tree' | 'grid')}
            >
              <TabsList className="w-full">
                <TabsTrigger value="tree" className="w-1/2">
                  <FolderSearch size={16} className="mr-2" />
                  Tree View
                </TabsTrigger>
                {dataset.fileType !== 'application/json' && (
                  <TabsTrigger value="grid" className="w-1/2">
                    <Table size={16} className="mr-2" />
                    Grid View
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>
    </div>
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
}: SearchResultsPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow mt-2 border rounded-lg overflow-hidden">
        {searchResults.length > 0 ? (
          <AutoSizer>
            {({ width }) => (
              <Virtuoso
                style={{ width, height: '96vh', padding: '0 0.5rem' }}
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
  )
}

export default DataExplorer
