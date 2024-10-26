'use client';

import React, { useState, useCallback } from 'react';
import { InlineDataExplorer } from '@/components/data/inline-data-explorer';
import { parse } from 'csv-parse/sync';
import { FileType } from '@/types';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { InlineViewerTabs } from '@/components/data/inline-viewer-tabs';

const DEFAULT_JSON_DATA = {
  "primitives": {
    "stringValue": "Hello, World!",
    "numberValue": 42,
    "booleanValue": true,
    "nullValue": null,
    "emptyString": "",
    "bigIntString": "9007199254740991"
  },
};

export default function InlineDataViewerPage() {
  const [inputData, setInputData] = useState<string>(JSON.stringify(DEFAULT_JSON_DATA, null, 2));
  const [fileType, setFileType] = useState<FileType>('application/json');
  const [inlineData, setInlineData] = useState<string | object>(DEFAULT_JSON_DATA);
  const [parsingError, setParsingError] = useState<string | null>(null);

  const validateInput = useCallback((data: string, type?: FileType) => {
    const inferredType = type || (data.includes(',') && !data.includes('{') && !data.includes('[')
      ? 'text/csv'
      : 'application/json');

    try {
      if (inferredType === 'application/json') {
        const jsonData = JSON.parse(data);
        setFileType('application/json');
        setInlineData(jsonData);
        setParsingError(null);
      } else {
        parse(data, {
          columns: true,
          skip_empty_lines: true,
          strict: true,
          columnValidation: true
        });
        setFileType('text/csv');
        setInlineData(data);
        setParsingError(null);
      }
    } catch (error) {
      const errorMessage = inferredType === 'text/csv'
        ? `CSV Parse Error: ${error instanceof Error ? error.message : 'Invalid CSV format'}`
        : `JSON Parse Error: ${error instanceof Error ? error.message : 'Invalid JSON format'}`;

      setParsingError(errorMessage);
      setInlineData(data);
      setFileType(inferredType);
    }
  }, []);

  const handleContentChange = useCallback((content: string, type?: FileType) => {
    setInputData(content);
    validateInput(content, type);
  }, [validateInput]);

  const handleTypeChange = useCallback((type: FileType) => {
    setFileType(type);
  }, []);

  return (
    <div className="flex flex-col h-[98vh]">
      <PanelGroup direction="horizontal" className="border rounded-md overflow-hidden">
        <Panel defaultSize={50} minSize={20}>
          <InlineViewerTabs
            inputData={inputData}
            fileType={fileType}
            onContentChange={handleContentChange}
            onTypeChange={handleTypeChange}
            error={parsingError}
          />
        </Panel>

        <PanelResizeHandle className="w-[1px] cursor-row-resize relative" />

        <Panel defaultSize={50} minSize={0}>
          {!parsingError ? (
            <InlineDataExplorer inlineData={inlineData} fileType={fileType} />
          ) : (
            <div className="flex flex-col h-full p-2 pb-4">
              <div className="flex items-center justify-center h-full text-gray-500">
                Please fix the errors to see the preview.
              </div>
            </div>
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
}
