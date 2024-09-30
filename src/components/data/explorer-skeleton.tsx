"use client"

import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Panel, PanelGroup } from 'react-resizable-panels';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FolderTree, Table, FileIcon } from 'lucide-react';
import { Bookmark } from 'lucide-react';

export function DataExplorerSkeleton() {
  return (
    <div className="w-full flex flex-col">
      <PanelGroup direction="horizontal" className="flex-grow relative">
        <div className="absolute w-full">
          <div className="flex items-center justify-end space-x-2">
            <Skeleton className="h-10 w-64" /> {/* SearchBar skeleton */}
          </div>
        </div>
        <Panel className='pt-12'>
          <Tabs defaultValue="tree" className="flex flex-col relative">
            <div className="absolute top-0 left-0 -translate-y-full space-x-2 mt-[1px]">
              <Button className="self-start" variant="outline" disabled>
                <FileIcon className="mr-2 h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </Button>
              <TabsList>
                <TabsTrigger value="tree">
                  <FolderTree size={16} className="mr-2" />
                  Tree View
                </TabsTrigger>
              </TabsList>
              <Button variant="outline">
                <Bookmark className="mr-2 h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </Button>
            </div>
            <TabsContent value="tree" className="flex-grow mt-2 rounded-lg overflow-hidden border bg-background" style={{ height: '80dvh' }}>
              <div className="h-full w-full">
                <TreeViewSkeleton />
              </div>
            </TabsContent>
            <TabsContent value="grid" className="flex-grow mt-2">
              <div className="h-full w-full">
                <GridViewSkeleton />
              </div>
            </TabsContent>
          </Tabs>
        </Panel>
      </PanelGroup>
    </div>
  );
}

function TreeViewSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(18)].map((_, i) => (
        <div key={i} className="flex items-center space-x-2 mt-2 mx-2">
          <Skeleton className="h-8 w-7" />
          <Skeleton className="h-8 w-11" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  );
}

function GridViewSkeleton() {
  return (
    <div className="p-4">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(14)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
