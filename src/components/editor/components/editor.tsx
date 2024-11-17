import React, { useCallback, useEffect } from 'react';
import { useEditor } from '@/editor/provider';
import { useTabs } from './tabs/provider';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Panel } from 'react-resizable-panels';
import { StatusLine } from "@/editor/components/statusline";
import { Toolbar } from '@/explorer/components/toolbar';
import { EnhancedMonacoEditor } from '@/editor/components/monaco';

import { Tab } from '@/tabs/components/tab';
import { AddDataset } from '@/tabs/components/add';

import { Tabs, TabsList, TabsContent, } from '@/components/ui/tabs'; // Tab UI

export function EditorPanel() {
  const { error, setContent } = useEditor();
  const { tabs, activeTab, updateTab, setActiveTab } = useTabs();

  // Handle tab changes
  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
    },
    [setActiveTab]
  );

  // Sync editor content with active tab
  const handleContentChange = useCallback(
    (newContent: string) => {
      if (activeTab) {
        const updatedTab = {
          ...activeTab,
          content: newContent,
          isModified: true,
          lastModified: new Date(),
        };
        updateTab(activeTab.id, updatedTab);
        setContent(newContent);
      }
    },
    [activeTab, updateTab, setContent]
  );

  // **Add this useEffect to synchronize content**
  useEffect(() => {
    if (activeTab) {
      setContent(activeTab.content);
    }
  }, [activeTab, setContent]);

  return (
    <Panel minSize={25} defaultSize={40} className="bg-background relative pt-16">
      <Tabs
        value={activeTab?.id}
        className="h-full flex flex-col"
        defaultValue={activeTab?.id}
        onValueChange={handleTabChange}
      >
        {/* Toolbar with Tabs */}
        <Toolbar
          left={
            <div className="flex items-center h-full border-none border-border">
              <TabsList className="h-full justify-start space-x-1">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.id}
                    id={tab.id}
                    name={tab.name}
                    isActive={tab.id === activeTab?.id}
                    isModified={tab.isModified}
                    content={tab.content}
                  />
                ))}
              </TabsList>
              <AddDataset />
            </div>
          }
        />

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="flex-1 h-full data-[state=active]:flex flex-col m-0 p-0"
            >
              <div className="flex-1 overflow-hidden">
                <EnhancedMonacoEditor
                  language={tab.name.endsWith('.json') ? 'json' : 'csv'}
                  value={tab.content}
                  onChange={handleContentChange}
                />
              </div>
              {error && tab.id === activeTab?.id && (
                <Alert variant="destructive" className="m-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          ))}
        </div>

        {/* Status Line */}
        <StatusLine />
      </Tabs>
    </Panel>
  );
}
