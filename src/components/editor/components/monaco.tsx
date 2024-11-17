// monaco-editor.tsx
import React, { useEffect } from 'react';
import MonacoEditor, { loader } from '@monaco-editor/react';

type MonacoEditorProps = {
  value: string;
  language: 'json' | 'csv';
  onChange: (value: string) => void;
};

export const EnhancedMonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language,
  onChange,
}) => {
  useEffect(() => {
    loader.init().then((monaco) => {
      // Define CSV language if needed
      if (language === 'csv') {
        monaco.languages.register({ id: 'csv' });
        monaco.languages.setMonarchTokensProvider('csv', {
          tokenizer: {
            root: [
              [/,/, 'delimiter'], // Comma separator
              [/".*?"/, 'string'], // Double-quoted strings
              [/[^,",\n]+/, 'field'], // Fields
            ],
          },
        });
      }

      // Define the custom dark theme with the provided colors
      monaco.editor.defineTheme('customDarkTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: '', foreground: 'abb2bf' }, // Default text
          { token: 'delimiter', foreground: '9197A2' }, // Delimiters
          { token: 'string', foreground: 'e07070' }, // Strings
          { token: 'field', foreground: '9197A2' }, // Fields
          { token: 'number', foreground: '909040' }, // Numbers
          { token: 'keyword', foreground: 'e06c75', fontStyle: 'bold' }, // Keywords
          { token: 'comment', foreground: '206020', fontStyle: 'italic' }, // Comments
          { token: 'attribute.name', foreground: '909040' }, // Attribute names in JSON
        ],
        colors: {
          'editor.background': '#0A0A0A', // Editor background
          'editor.foreground': '#9197A2', // Default foreground color
          'editorCursor.foreground': '#569CD6', // Cursor color
          'editorLineNumber.foreground': '#3B3E42', // Line number color
          'editorLineNumber.activeForeground': '#9197A2', // Active line number
          'editor.selectionBackground': '#333842', // Selection color
          'editor.selectionHighlightBackground': '#206020', // Highlighted selection
        },
      });
    });
  }, [language]);

  return (
    <MonacoEditor
      height="100%"
      language={language}
      theme="customDarkTheme"
      value={value}
      onChange={(newValue) => onChange(newValue || '')}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        largeFileOptimizations: true,
        lineHeight: 1.5,
        formatOnType: true,
        fontFamily: 'var(--font-mono)',
        renderLineHighlight: 'none',
        renderWhitespace: 'none',
        automaticLayout: true,
        scrollBeyondLastColumn: 0,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        folding: false,
      }}
    />
  );
};
