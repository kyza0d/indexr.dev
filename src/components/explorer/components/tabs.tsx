import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FolderSearch, Table } from 'lucide-react';
import { useExplorerContext } from '@/explorer/provider';

interface ViewTabsProps {
  disabled?: boolean;
}

export const ViewTabs = ({ disabled = false }: ViewTabsProps) => {
  const { currentView, setCurrentView } = useExplorerContext();

  console.log('[ViewTabs] Rendering with currentView:', currentView);

  const handleViewChange = React.useCallback((value: string) => {
    console.log('[ViewTabs] handleViewChange called with value:', value);
    if (value === 'tree' || value === 'grid') {
      console.log('[ViewTabs] Calling setCurrentView with:', value);
      setCurrentView(value);
    }
  }, [setCurrentView]);

  return (
    <Tabs
      defaultValue={currentView}
      value={currentView}
      onValueChange={handleViewChange}
      className="w-72"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="tree"
          disabled={disabled}
          onClick={() => console.log('[ViewTabs] Tree tab clicked')}
        >
          <FolderSearch size={16} className="mr-2" />
          Tree View
        </TabsTrigger>
        <TabsTrigger
          value="grid"
          disabled={disabled}
          onClick={() => console.log('[ViewTabs] Grid tab clicked')}
        >
          <Table size={16} className="mr-2" />
          Grid View
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
