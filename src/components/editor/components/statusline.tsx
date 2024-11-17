// src/components/editor/components/statusline.tsx

import React, { useMemo } from 'react';
import { useEditor } from '@/components/editor/provider';
import { FileJson, FileSpreadsheet, File } from 'lucide-react';
import { Check, X } from 'lucide-react'

export function StatusLine() {
  const { content, error } = useEditor();

  // Determine if the content is valid (no parsing errors)
  const isValid = useMemo(() => !error, [error]);

  // Determine the file type based on content
  const fileType = useMemo(() => {
    if (!content) return 'unknown';
    try {
      JSON.parse(content);
      return 'application/json';
    } catch {
      // Simple check for CSV format
      const lines = content.trim().split('\n');
      if (lines.length > 1 && lines[0].includes(',')) {
        return 'text/csv';
      }
      return 'unknown';
    }
  }, [content]);

  // Calculate file size
  const getFileSize = () => {
    const bytes = new Blob([content]).size;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm border-t bg-primary/30">
      <div className="flex items-center space-x-2">
        {fileType === 'application/json' ? (
          <FileJson className="w-4 h-4" />
        ) : fileType === 'text/csv' ? (
          <FileSpreadsheet className="w-4 h-4" />
        ) : (
          <File className="w-4 h-4" />
        )}
        <span>
          {fileType === 'application/json' ? 'JSON' : 'CSV'}
        </span>
        <span>•</span>
        <span className='text-primary-foreground/70'>{getFileSize()}</span>
      </div>
      <div>
        <span className={isValid ? 'text-green-500' : 'text-red-500'}>
          {isValid ? <Check /> : <X />}
        </span>
      </div>
    </div>
  );
}
