"use client";

import React, { useState } from 'react';
import { useExplorerContext } from '@/explorer/provider';
import { Tree } from '@/tree/components';
import { Grid } from '@/grid/components/grid';
import { TreeProvider } from '@/tree/provider';
import { GridProvider } from '@/grid/provider';
import { Toolbar } from '@/explorer/components/toolbar';
import { ViewTabs } from '@/explorer/components/tabs';
import { SearchResults } from '@/search/components/results';
import { SearchInput } from '@/search/components/input';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { RawDataButton } from '@/explorer/components/raw-button/button';
import { RawDataModal } from '@/explorer/components/raw-button/modal';

import { SaveDatasetButton } from '@/dataset/components/save';

const Views = {
  tree: Tree,
  grid: Grid,
};

function DataViewContainer() {
  const { currentView, dataset, searchTerm } = useExplorerContext();
  const [isRawDataOpen, setIsRawDataOpen] = useState(false);
  const DataView = Views[currentView];

  return (
    <>
      {dataset && (
        <RawDataModal
          isOpen={isRawDataOpen}
          onOpenChange={setIsRawDataOpen}
          datasetId={dataset.id}
        />
      )}
      <PanelGroup direction="horizontal" className="flex-grow relative border bg-primary/70 rounded-lg">
        <Panel minSize={25} className="bg-background pt-16">
          <div className="h-full flex flex-col">
            <Toolbar
              left={(<>
                <ViewTabs />
                {dataset && (<RawDataButton onClick={() => setIsRawDataOpen(true)} />)}
                {dataset && (<SaveDatasetButton dataset={dataset} />)}
              </>)}
              right={<SearchInput />}
            />
            <div className="flex-1 relative">
              <DataView />
            </div>
          </div>
        </Panel>

        {searchTerm.length > 1 && (
          <>
            <PanelResizeHandle className="w-[1px] bg-border hover:bg-foreground/10 transition-colors" />
            <Panel minSize={25} className="bg-background relative pt-16">
              <div className="h-full flex flex-col">
                <SearchResults />
              </div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </>
  );
}

export function Explorer() {
  return <ExplorerLayout />;
}

function ExplorerLayout() {
  const { data, error, currentView } = useExplorerContext();

  if (error) {
    return (
      <div className="flex items-center justify-center h-[96vh] text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-[97dvh]">
      <TreeProvider data={data} currentView={currentView}>
        <GridProvider data={data} currentView={currentView}>
          <DataViewContainer />
        </GridProvider>
      </TreeProvider>
    </div>
  );
}

