import React, { useState, useCallback } from 'react';
import { useInlineDataExplorer } from '@/hooks/use-inline-data-explorer';
import { TreeView } from '@/components/data/tree-view';
import { GridView } from '@/components/data/grid-view';
import { SearchBar } from '@/components/search/search-bar';
import { SearchResult } from '@/components/search/search-result';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Virtuoso } from 'react-virtuoso';
import { TreeProvider } from '@/components/data/tree-context';
import { GridProvider } from '@/components/data/grid-context';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FileType } from '@/types';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FolderSearch, Table } from 'lucide-react';
import { Badge } from '../ui/badge';

export function InlineDataExplorer({ inlineData, fileType }: { inlineData: string | object; fileType: FileType }) {
  const [currentView, setCurrentView] = useState<'tree' | 'grid'>('tree');

  const {
    isLoading,
    error,
    treeData,
    gridData,
    searchTerm,
    setSearchTerm,
    searchResults,
    totalItems,
    isValidSyntax,
  } = useInlineDataExplorer(inlineData, fileType);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, [setSearchTerm]);

  if (isLoading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-full">Error: {error}</div>;

  return (
    <div className="h-[98vh]">

      <TreeProvider currentView={currentView}>
        <GridProvider currentView={currentView}>
          <PanelGroup direction="vertical" className="flex-grow relative border bg-primary/70 pt-16">

            <Panel minSize={25} maxSize={searchTerm ? 125 : 0} className="bg-background border-t">
              <Virtuoso
                totalCount={searchResults.length}
                itemContent={(index) => (
                  <SearchResult
                    key={index}
                    result={{ ...searchResults[index], currentIndex: index }}
                    searchTerm={searchTerm}
                  />
                )}
              />
            </Panel>

            <PanelResizeHandle className="bg-border h-[1px] cursor-col-resize " hidden={searchTerm ? false : true} />

            <Panel minSize={25}>
              {isValidSyntax ? (

                <Tabs
                  defaultValue={currentView}
                  className="flex h-full flex-col z-10"
                  onValueChange={(value) => setCurrentView(value as 'tree' | 'grid')}
                >

                  <div className='flex items-center justify-between absolute top-0 w-full px-2'>

                    <TabsList className='mt-2'>
                      <TabsTrigger value="tree">
                        <FolderSearch size={16} className="mr-2" />
                        Tree View
                      </TabsTrigger>

                      <TabsTrigger value="grid">
                        <Table size={16} className="mr-2" />
                        Grid View
                      </TabsTrigger>
                    </TabsList>

                    <div className="relative">
                      <SearchBar value={searchTerm} onChange={handleSearch} className="z-10 w-96" />
                      {searchResults.length > 0 && (
                        <Badge variant="outline" className="absolute top-4 right-3 text-sm p-2 h-8 z-10">
                          {searchResults.length} / {totalItems}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <TabsContent value="tree" className="flex-grow">
                    <AutoSizer>
                      {({ height, width }) => (
                        <div
                          style={{ height, width }}
                          className="bg-background"
                        >
                          <TreeView data={treeData} />
                        </div>
                      )}
                    </AutoSizer>
                  </TabsContent>

                  <TabsContent value="grid" className="flex-grow">
                    <AutoSizer>
                      {({ height, width }) => (
                        <div
                          style={{ height, width }}
                          className="bg-background"
                        >
                          <GridView data={gridData} />
                        </div>
                      )}
                    </AutoSizer>
                  </TabsContent>
                </Tabs>

              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Invalid syntax. Please correct the input to see the preview.</p>
                </div>
              )}
            </Panel>
          </PanelGroup>

        </GridProvider>
      </TreeProvider>
    </div>
  );
}
