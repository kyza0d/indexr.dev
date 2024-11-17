import React, { createContext, useState, useEffect, useContext } from 'react';
import { debounce } from 'lodash';
import { FileType, IndexItem } from '@/types';
import { parseAndValidateContent } from '@/tabs/utils';
import { uuid } from 'uuidv4';
import { toast } from '@/hooks/use-toast';

// Constants for storage management
const MAX_TABS = 10;
const MAX_CONTENT_LENGTH = 1000000; // 1MB per tab content
const STORAGE_KEY = 'tabs';

interface Tab {
  id: string;
  name: string;
  content: string;
  fileType: FileType;
  isModified: boolean;
  lastModified: Date;
  parsedData: IndexItem[];
  error: string | null;
  isValid: boolean;
}

interface TabsContextType {
  tabs: Tab[];
  activeTab: Tab | null;
  addTab: (name: string, content: string, fileType: FileType) => void;
  updateTab: (id: string, updatedTab: Tab) => void;
  renameTab: (id: string, name: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const saveToStorage = (tabs: Tab[]): boolean => {
  try {
    // Prepare data for storage by removing parsedData to save space
    const storageData = tabs.map(({ parsedData, ...tab }) => ({
      ...tab,
      content: tab.content.slice(0, MAX_CONTENT_LENGTH) // Limit content size
    }));

    const serializedData = JSON.stringify(storageData);
    localStorage.setItem(STORAGE_KEY, serializedData);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        // Try to free up space by removing older tabs
        const reducedTabs = tabs.slice(-MAX_TABS);
        try {
          const reducedData = reducedTabs.map(({ parsedData, ...tab }) => ({
            ...tab,
            content: tab.content.slice(0, MAX_CONTENT_LENGTH)
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedData));
          return true;
        } catch {
          // If still failing, clear storage
          localStorage.removeItem(STORAGE_KEY);
          toast({
            title: "Storage limit reached",
            description: "Some tabs couldn't be saved due to storage limitations.",
            variant: "destructive"
          });
        }
      }
    }
    return false;
  }
};

const loadFromStorage = (): Tab[] => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return [];

    const parsedTabs = JSON.parse(storedData);
    return parsedTabs.map((tab: Omit<Tab, 'parsedData'>) => ({
      ...tab,
      lastModified: new Date(tab.lastModified),
      parsedData: [], // Will be reparsed when needed
    }));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Load saved tabs on mount
  useEffect(() => {
    const storedTabs = loadFromStorage();
    if (storedTabs.length > 0) {
      setTabs(storedTabs);
      setActiveTabId(storedTabs[0].id);
    }
  }, []);

  // Save tabs with debounce
  const debouncedSave = React.useMemo(
    () => debounce((tabsToSave: Tab[]) => {
      saveToStorage(tabsToSave);
    }, 1000),
    []
  );

  useEffect(() => {
    if (tabs.length > 0) {
      debouncedSave(tabs);
    }
  }, [tabs, debouncedSave]);

  const addTab = async (name: string, content: string, fileType: FileType) => {
    if (tabs.length >= MAX_TABS) {
      toast({
        title: "Tab limit reached",
        description: `Cannot create more than ${MAX_TABS} tabs. Please close some tabs first.`,
        variant: "destructive"
      });
      return;
    }

    const { parsedData, error, isValid } = await parseAndValidateContent(content);

    const newTab: Tab = {
      id: uuid(),
      name,
      content: content.slice(0, MAX_CONTENT_LENGTH),
      fileType,
      isModified: false,
      lastModified: new Date(),
      parsedData,
      error,
      isValid,
    };

    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const updateTab = async (id: string, updatedTab: Tab) => {
    const { parsedData, error, isValid } = await parseAndValidateContent(updatedTab.content);

    const newTab = {
      ...updatedTab,
      content: updatedTab.content.slice(0, MAX_CONTENT_LENGTH),
      parsedData,
      error,
      isValid,
      isModified: true,
      lastModified: new Date(),
    };

    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === id ? newTab : tab))
    );
  };

  const closeTab = (id: string) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id));
    if (activeTabId === id) {
      setActiveTabId(tabs[0]?.id || null);
    }
  };

  const renameTab = (id: string, name: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) => (tab.id === id ? { ...tab, name } : tab))
    );
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || null;

  return (
    <TabsContext.Provider
      value={{
        tabs,
        activeTab,
        addTab,
        updateTab,
        renameTab,
        closeTab,
        setActiveTab: setActiveTabId
      }}
    >
      {children}
    </TabsContext.Provider>
  );
}

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
};
