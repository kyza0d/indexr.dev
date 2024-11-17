"use client"

import React, { useState, useMemo, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { EditorPanel } from '@/editor/components/editor';
import { EditorProvider, useEditor } from '@/editor/provider';

import { TabsProvider } from '@/tabs/provider';

import { SearchResults } from '@/search/components/results';
import { SearchInput } from '@/search/components/input';


import { Grid } from '@/grid/components/grid';
import { GridProvider } from '@/grid/provider';

import { Tree } from '@/tree/components';
import { TreeProvider } from '@/tree/provider';

import { ViewTabs } from '@/explorer/components/tabs';
import { Toolbar } from '@/explorer/components/toolbar';

import { ExplorerProvider, useExplorerContext } from '@/explorer/provider';

const Views = {
  tree: Tree,
  grid: Grid,
} as const;

function DataDisplayPanel() {
  const { searchTerm, currentView } = useExplorerContext();
  const showSearchResults = searchTerm.length >= 2;

  console.log('[DataDisplayPanel] Rendering with:', {
    currentView,
    showSearchResults,
  });

  const DataView = Views[currentView];
  console.log('[DataDisplayPanel] Selected DataView:', DataView.name);

  return (
    <Panel minSize={40} defaultSize={60} className="bg-background relative pt-16">
      <PanelGroup direction="vertical" className="h-full">
        <Panel minSize={25} maxSize={searchTerm.length >= 2 ? 100 : 0}>
          <div className="h-full overflow-auto">
            <SearchResults />
          </div>
        </Panel>
        <PanelResizeHandle className="h-[1px] w-full bg-border hover:bg-foreground/10 transition-colors" hidden={!showSearchResults} />
        <Panel>
          <Toolbar
            left={<ViewTabs />}
            right={<SearchInput />}
          />
          <div className="h-full overflow-hidden">
            {React.createElement(DataView)}
          </div>
        </Panel>
      </PanelGroup>
    </Panel>
  );
}


function EditorPageLayout() {
  const { parsedData, content } = useEditor();
  const [view, setView] = useState<'tree' | 'grid'>('tree');

  const handleViewChange = useCallback((newView: 'tree' | 'grid') => {
    setView(newView);
  }, []);

  const editorDataset = useMemo(() => ({
    id: 'editor',
    data: parsedData,
    fileType: content.startsWith('{') ? 'application/json' : 'text/csv',
  }), [parsedData, content]);

  return (
    <ExplorerProvider
      dataset_id={editorDataset}
      inlineData={parsedData}
      currentView={view}
      setCurrentView={handleViewChange}
    >
      <TreeProvider data={parsedData} currentView={view}>
        <GridProvider data={parsedData} currentView={view}>
          <PanelGroup
            direction="horizontal"
            className="flex-grow relative border bg-primary/70 rounded-lg"
          >
            <EditorPanel />
            <PanelResizeHandle className="w-[1px] bg-border hover:bg-foreground/10 transition-colors" />
            <DataDisplayPanel />
          </PanelGroup>
        </GridProvider>
      </TreeProvider>
    </ExplorerProvider>
  );
}

export default function EditorPage() {
  return (
    <div className="h-[96dvh]">
      <TabsProvider>
        <EditorProvider>
          <EditorPageLayout />
        </EditorProvider>
      </TabsProvider>
    </div>
  );
}
