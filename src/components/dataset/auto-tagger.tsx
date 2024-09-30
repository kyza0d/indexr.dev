import React from 'react';
import { Loader2 } from 'lucide-react';
import { useGenerateTags } from '@/hooks/use-generate-tags';

interface AutoTaggerProps {
  fileName: string;
  fileContent: string;
  onTagsGenerated: (tags: string[]) => void;
  trigger: boolean;
}

export function AutoTagger({
  fileName,
  fileContent,
  onTagsGenerated,
  trigger,
}: AutoTaggerProps): JSX.Element {
  const { mutate: generateTags, isLoading: isGenerating, error } = useGenerateTags(
    onTagsGenerated
  );

  React.useEffect(() => {
    if (trigger) {
      generateTags({ fileName, fileContent });
    }
  }, [trigger, fileName, fileContent, generateTags]);

  return (
    <div className="space-y-4">
      {isGenerating && (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>Generating Tags...</span>
        </div>
      )}
      {error && (
        <div className="text-red-500 text-sm mt-2" role="alert">
          Error: {error.message}
        </div>
      )}
    </div>
  );
}
