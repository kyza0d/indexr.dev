import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { IndexItem, SearchResult } from '@/types';
import { normalize } from '@/data/lib/normalize';
import { createSearchFunction } from '@/search/lib/utils';

export enum FileType {
  JSON = 'application/json',
  CSV = 'text/csv'
}

const DEFAULT_CONTENT = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "country": "USA"
  },
  "hobbies": ["reading", "hiking", "photography"]
}`;

interface EditorSearchState {
  searchTerm: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  setSearchTerm: (term: string) => void;
}

interface EditorContextType extends EditorSearchState {
  content: string;
  parsedData: IndexItem[];
  error: string | null;
  fileType: string;
  isValid: boolean;
  setContent: (content: string) => void;
  reset: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({
  children,
  initialContent = DEFAULT_CONTENT,
  initialFileType = FileType.JSON,
  validationDelay = 500
}: {
  children: React.ReactNode;
  initialContent?: string;
  initialFileType?: FileType;
  validationDelay?: number;
}) {
  const [content, setContent] = useState(initialContent);
  const [parsedData, setParsedData] = useState<IndexItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState(initialFileType);
  const [isValid, setIsValid] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const detectFileType = (content: string): FileType => {
    const trimmedContent = content.trim();
    try {
      JSON.parse(trimmedContent);
      return FileType.JSON;
    } catch {
      const lines = trimmedContent.split('\n');
      if (lines.length > 1 && lines[0].includes(',')) {
        return FileType.CSV;
      }
    }
    return FileType.JSON;
  };

  const parseAndValidateContent = useCallback(async (newContent: string) => {
    if (!newContent.trim()) {
      setParsedData([]);
      setError(null);
      setIsValid(true);
      return;
    }

    try {
      const detectedType = detectFileType(newContent);
      setFileType(detectedType);

      const normalizedData = await normalize(
        detectedType === FileType.CSV ? newContent : JSON.parse(newContent),
        detectedType
      );

      setParsedData(normalizedData);
      setError(null);
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid input format');
      setIsValid(false);
      setParsedData([]);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => parseAndValidateContent(content), validationDelay);
    return () => clearTimeout(timeoutId);
  }, [content, parseAndValidateContent, validationDelay]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.length >= 2 && parsedData.length > 0) {
      setIsSearching(true);
      const searchFunction = createSearchFunction(parsedData);
      const results = searchFunction(searchTerm);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, parsedData]);

  const value = {
    content,
    setContent,
    parsedData,
    error,
    fileType,
    searchTerm,
    searchResults,
    isSearching,
    setSearchTerm,
    isValid,
    reset: useCallback(() => {
      setContent(initialContent);
      setParsedData([]);
      setError(null);
      setSearchTerm('');
      setSearchResults([]);
    }, [initialContent]),
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within an EditorProvider');
  return context;
};
