import React from 'react';

interface HighlightProps {
  text: string | number | null | undefined;
  searchTerm: string | undefined;
}

function escapeRegExp(string: string | undefined) {
  return string ? string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '';
}

export const Highlight: React.FC<HighlightProps> = React.memo(({ text, searchTerm }) => {
  if (text === null || text === undefined) {
    return <span className="text-muted-foreground">null</span>;
  }

  const stringText = String(text);

  if (!searchTerm) {
    return <span>{stringText}</span>;
  }

  const escapedSearchTerm = escapeRegExp(searchTerm);
  const parts = stringText.split(new RegExp(`(${escapedSearchTerm})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark
            key={index}
            className="bg-yellow-200 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-300 rounded-sm"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
});

Highlight.displayName = 'Highlight';
