
import { IndexItem } from '@/types';
import { normalize } from '@/data/lib/normalize';
import { FileType } from '@/editor/provider';

/**
 * Detects the file type (JSON or CSV) based on the content.
 */
export const detectFileType = (content: string): FileType => {
  const trimmedContent = content.trim();
  try {
    JSON.parse(trimmedContent);
    return FileType.JSON;
  } catch {
    // Not valid JSON, check for CSV patterns
    const lines = trimmedContent.split('\n');
    if (lines.length > 1 && lines[0].includes(',')) {
      return FileType.CSV;
    }
  }
  return FileType.JSON; // Default to JSON
};

/**
 * Parses and validates the content of a tab.
 * Returns the parsed data, any error message, the file type, and whether the content is valid.
 */
// In utils.ts
export const parseAndValidateContent = async (content: string): Promise<{
  parsedData: IndexItem[];
  error: string | null;
  fileType: FileType;
  isValid: boolean;
}> => {
  if (!content.trim()) {
    return {
      parsedData: [],
      error: null,
      fileType: FileType.JSON,
      isValid: true,
    };
  }

  try {
    const detectedType = detectFileType(content);
    const parsedContent =
      detectedType === FileType.CSV ? content : JSON.parse(content);
    const normalizedData = await normalize(parsedContent, detectedType);
    return {
      parsedData: normalizedData,
      error: null,
      fileType: detectedType,
      isValid: true,
    };
  } catch (err) {
    return {
      parsedData: [],
      error: err instanceof Error ? err.message : 'Invalid input format',
      fileType: FileType.JSON,
      isValid: false,
    };
  }
};
