import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllTabs, saveTab, deleteTab } from '@/lib/tabs-db';
import { Button } from "@/components/ui/button";
import { X, FileSpreadsheet, FileJson2, Plus, AlertCircle, Pencil } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface TabState {
  id: string;
  title: string;
  content: string;
  type: 'application/json' | 'text/csv';
  lastModified?: number;
}

interface InlineViewerTabsProps {
  inputData: string;
  fileType: 'application/json' | 'text/csv';
  onContentChange: (content: string, type: 'application/json' | 'text/csv') => void;
  onTypeChange: (type: 'application/json' | 'text/csv') => void;
}

const DEFAULT_TABS: TabState[] = [
  {
    id: 'json-example',
    title: 'JSON Example',
    content: JSON.stringify({ message: "Hello World" }, null, 2),
    type: 'application/json',
  },
  {
    id: 'csv-example',
    title: 'CSV Example',
    content: 'name,age\nJohn,30\nJane,25',
    type: 'text/csv',
  }
];

const ExpandableInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      // Add some padding to prevent text from touching the edges
      inputRef.current.style.width = `${spanRef.current.offsetWidth + 10}px`;
    }
  }, [props.value]);

  return (
    <div className="relative inline-block">
      {/* Hidden span to measure text width */}
      <span
        ref={spanRef}
        className="invisible absolute whitespace-pre py-2"
        style={{
          font: window.getComputedStyle(inputRef.current || document.body).font
        }}
      >
        {props.value}
      </span>
      <Input
        {...props}
        ref={(node) => {
          // Handle both forwardRef and local ref
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          inputRef.current = node;
        }}
        className="w-full border-none min-w-[50px] h-5 bg-transparent px-2"
      />
    </div>
  );
});

const MAX_TABS = 10;
const AUTO_SAVE_DELAY = 1000; // 1 second

export function InlineViewerTabs({
  inputData,
  fileType,
  onContentChange,
  onTypeChange,
}: InlineViewerTabsProps) {
  const [tabs, setTabs] = useState<TabState[]>(DEFAULT_TABS);
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_TABS[0].id);
  const [isLoading, setIsLoading] = useState(true);
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout>();
  const previousContentRef = useRef<string>(inputData);
  const editInputRef = useRef<HTMLInputElement>(null);

  const detectFileType = useCallback((content: string): 'application/json' | 'text/csv' => {
    if (!content.trim()) return 'application/json';

    try {
      JSON.parse(content);
      return 'application/json';
    } catch {
      // Check for CSV characteristics
      const lines = content.trim().split('\n');
      if (lines.length > 0) {
        const headerCount = lines[0].split(',').length;
        const isConsistentStructure = lines.every(line => line.split(',').length === headerCount);
        if (isConsistentStructure && headerCount > 1) {
          return 'text/csv';
        }
      }
      return 'application/json';
    }
  }, []);

  const validateContent = useCallback((content: string, type: 'application/json' | 'text/csv'): string | null => {
    if (!content.trim()) return null;

    if (type === 'application/json') {
      try {
        JSON.parse(content);
        return null;
      } catch (error) {
        return `JSON Syntax Error: ${(error as Error).message}`;
      }
    } else {
      // Basic CSV validation
      const lines = content.trim().split('\n');
      if (lines.length > 0) {
        const headerCount = lines[0].split(',').length;
        const invalidLines = lines.filter(line => line.split(',').length !== headerCount);
        if (invalidLines.length > 0) {
          return `CSV Format Error: Inconsistent number of columns at line(s) ${invalidLines.map((_, i) => i + 1).join(', ')}`;
        }
      }
    }
    return null;
  }, []);

  interface StatusBarProps {
    fileType: 'application/json' | 'text/csv';
    lineCount: number;
    columnCount: number;
    selectionCount: number;
  }

  function StatusBar({ fileType, lineCount, columnCount, selectionCount }: StatusBarProps) {
    return (
      <div className="mt-auto py-3 bg-primary/70 border-t px-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>{fileType === 'application/json' ? 'JSON' : 'CSV'}</span>
          <span>Lines: {lineCount}</span>
          <span>Col: {columnCount}</span>
          {selectionCount > 0 && <span>Selected: {selectionCount} chars</span>}
        </div>
        <div>
          <span>UTF-8</span>
        </div>
      </div>
    );
  }

  // Start editing tab title
  const startEditing = useCallback((tabId: string, currentTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingTabId(tabId);
    setEditingTitle(currentTitle);
  }, []);

  // Handle input focus when editing starts
  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTabId]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(e.target.value);
  }, []);

  const saveTitle = useCallback(async () => {
    if (!editingTabId) return;

    const newTitle = editingTitle.trim();
    if (!newTitle) {
      toast({
        title: 'Invalid title',
        description: 'Tab title cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updatedTabs = tabs.map(tab =>
        tab.id === editingTabId
          ? { ...tab, title: newTitle, lastModified: Date.now() }
          : tab
      );
      setTabs(updatedTabs);

      const updatedTab = updatedTabs.find(tab => tab.id === editingTabId);
      if (updatedTab) {
        await saveTab(updatedTab);
      }

      setEditingTabId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error saving tab title:', error);
      toast({
        title: 'Error',
        description: 'Failed to save tab title',
        variant: 'destructive',
      });
    }
  }, [editingTabId, editingTitle, tabs]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditingTitle('');
    }
  }, [saveTitle]);

  // Load saved tabs on component mount
  useEffect(() => {
    const loadSavedTabs = async () => {
      try {
        const savedTabs = await getAllTabs();
        if (savedTabs.length > 0) {
          setTabs(savedTabs);
          setActiveTab(savedTabs[0].id);
          onContentChange(savedTabs[0].content, savedTabs[0].type);
          onTypeChange(savedTabs[0].type);
        } else {
          await Promise.all(DEFAULT_TABS.map(tab => saveTab(tab)));
        }
      } catch (error) {
        console.error('Error loading saved tabs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved tabs. Using default tabs instead.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedTabs();

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [onContentChange, onTypeChange]);

  const handleTabChange = useCallback(async (tabId: string) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTab(tabId);
      const detectedType = detectFileType(tab.content);
      onContentChange(tab.content, detectedType);
      onTypeChange(detectedType);
      setSyntaxError(validateContent(tab.content, detectedType));
    }
  }, [tabs, onContentChange, onTypeChange, detectFileType, validateContent]);

  const handleContentUpdate = useCallback(async (newContent: string) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const detectedType = detectFileType(newContent);
    const error = validateContent(newContent, detectedType);
    setSyntaxError(error);

    // Always update the content in the UI
    previousContentRef.current = newContent;
    onContentChange(newContent, detectedType);
    onTypeChange(detectedType);

    // Set up auto-save timer
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const updatedTabs = tabs.map(tab =>
          tab.id === activeTab
            ? { ...tab, content: newContent, type: detectedType, lastModified: Date.now() }
            : tab
        );
        setTabs(updatedTabs);

        const activeTabData = updatedTabs.find(tab => tab.id === activeTab);
        if (activeTabData) {
          await saveTab(activeTabData);
        }
      } catch (error) {
        console.error('Error saving tab:', error);
        toast({
          title: 'Error',
          description: 'Failed to save changes. Your changes are still visible but may not persist after reload.',
          variant: 'destructive',
        });
      }
    }, AUTO_SAVE_DELAY);
  }, [activeTab, tabs, onContentChange, onTypeChange, detectFileType, validateContent]);

  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selectionLength, setSelectionLength] = useState(0);

  const handleSelectionChange = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd, value } = target;

    const textBeforeCursor = value.substring(0, selectionStart);
    const currentLine = (textBeforeCursor.match(/\n/g) || []).length + 1;
    const lastNewLine = textBeforeCursor.lastIndexOf('\n');
    const currentColumn = lastNewLine === -1 ? selectionStart + 1 : selectionStart - lastNewLine;

    setCursorPosition({ line: currentLine, column: currentColumn });
    setSelectionLength(Math.abs(selectionEnd - selectionStart));
  }, []);

  const addNewTab = useCallback(async () => {
    if (tabs.length >= MAX_TABS) {
      toast({
        title: 'Maximum tabs reached',
        description: `You can have a maximum of ${MAX_TABS} tabs open at once.`,
        variant: 'destructive',
      });
      return;
    }

    const newTab: TabState = {
      id: `tab-${Date.now()}`,
      title: `Tab ${tabs.length + 1}`,
      content: '',
      type: 'application/json',
      lastModified: Date.now(),
    };

    try {
      await saveTab(newTab);
      setTabs(prev => [...prev, newTab]);
      setActiveTab(newTab.id);
      onContentChange('', 'application/json');
      onTypeChange('application/json');
      setSyntaxError(null);
    } catch (error) {
      console.error('Error adding new tab:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new tab',
        variant: 'destructive',
      });
    }
  }, [tabs.length, onContentChange, onTypeChange]);

  const removeTab = useCallback(async (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (tabs.length <= 1) {
      toast({
        title: 'Cannot remove tab',
        description: 'You must keep at least one tab open.',
      });
      return;
    }

    try {
      await deleteTab(tabId);
      setTabs(prev => {
        const newTabs = prev.filter(tab => tab.id !== tabId);
        if (activeTab === tabId) {
          const firstTab = newTabs[0];
          setActiveTab(firstTab.id);
          onContentChange(firstTab.content, firstTab.type);
          onTypeChange(firstTab.type);
          setSyntaxError(validateContent(firstTab.content, firstTab.type));
        }
        return newTabs;
      });
    } catch (error) {
      console.error('Error removing tab:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove tab',
        variant: 'destructive',
      });
    }
  }, [tabs.length, activeTab, onContentChange, onTypeChange, validateContent]);

  const renderTabContent = useCallback((tab: TabState) => {

    if (editingTabId === tab.id) {
      return (
        <div className="flex items-center" onClick={e => e.stopPropagation()}>
          {tab.type === 'application/json' ? (
            <FileJson2 className="h-4 w-4" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}

          <ExpandableInput
            ref={editInputRef}
            value={editingTitle}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            onBlur={saveTitle}
          />

        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group">
        {tab.type === 'application/json' ? (
          <FileJson2 className="h-4 w-4" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        <span>{tab.title}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-accent/50"
          onClick={(e) => startEditing(tab.id, tab.title, e)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        {tabs.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-destructive/10"
            onClick={(e) => removeTab(tab.id, e)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }, [editingTabId, editingTitle, handleKeyDown, handleTitleChange, saveTitle, startEditing, removeTab, tabs.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 rounded w-48" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between bg-primary/70 px-2">
        <ScrollArea className="w-full max-w-[calc(100%-40px)]" orientation="horizontal">
          <div className="flex items-center pt-16">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex h-full mt-[1px]">
              <div className='absolute top-0 left-0 mt-2 space-x-2'>
                <TabsList>
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                    >
                      {renderTabContent(tab)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <Button
                  size="icon"
                  className='border bg-background'
                  onClick={addNewTab}
                  title="Add New Tab"
                  disabled={tabs.length >= MAX_TABS}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      {/* Editor Area */}
      <div className="min-h-0 border-t overflow-scroll">
        {syntaxError && (
          <Alert variant="destructive" className="m-2 bg-neutral-800 flex-shrink-0 absolute inset-0 h-16">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{syntaxError}</AlertDescription>
          </Alert>
        )}

        <div className="flex w-full">
          {/* Line Numbers */}
          <div className="w-10 pointer-events-none">
            {inputData.split('\n').map((_, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground text-right pr-2 leading-6"
              >
                {i + 1}
              </div>
            ))}
          </div>

          <Textarea
            value={inputData}
            onChange={(e) => handleContentUpdate(e.target.value)}
            onSelect={handleSelectionChange}
            spellCheck={false}
            className={cn(
              "leading-6 overflow-hidden",
              "resize-none font-mono",
              "rounded-none border-0",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "transition-colors duration-200",
              syntaxError && "bg-destructive/5"
            )}
            placeholder="Enter your data here..."
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        fileType={fileType}
        lineCount={inputData.split('\n').length}
        columnCount={cursorPosition.column}
        selectionCount={selectionLength}
      />
    </div>
  );
}
