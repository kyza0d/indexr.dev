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
    <div className="h-[96vh]">
      <SearchBar value={searchTerm} onChange={handleSearch} className="z-10 my-2 w-96" />

      <TreeProvider currentView={currentView}>
        <GridProvider currentView={currentView}>
          <PanelGroup direction="vertical" className="h-full">
            <Panel minSize={25} maxSize={searchTerm ? 125 : 0}>
              <div className="flex justify-between items-center p-2">
                <div>{searchResults.length} / {totalItems} Results</div>
              </div>
              <Virtuoso
                style={{ height: 'calc(100% - 40px)' }}
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

            <PanelResizeHandle className="h-2 cursor-row-resize py-2" hidden={searchTerm ? false : true}>
              <div className="w-full h-[1px] bg-border rounded"></div>
            </PanelResizeHandle>

            <Panel minSize={25}>
              {isValidSyntax ? (
                <Tabs
                  defaultValue={currentView}
                  className="h-full"
                  onValueChange={(value) => setCurrentView(value as 'tree' | 'grid')}
                >
                  <TabsList className="mb-2 mx-2">
                    <TabsTrigger value="tree">Tree View</TabsTrigger>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tree" className="h-[calc(100%-40px)]">
                    <TreeView data={treeData} />
                  </TabsContent>
                  <TabsContent value="grid" className="h-[calc(100%-40px)]">
                    <GridView data={gridData} />
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
