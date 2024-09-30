
import { useMutation } from 'react-query';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const openai = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const tagSchema = z.object({
  tags: z.array(z.string()),
});

type TagSchemaType = z.infer<typeof tagSchema>;

interface GenerateObjectResult {
  object: TagSchemaType;
}

interface GenerateTagsParams {
  fileName: string;
  fileContent: string;
}

/**
 * Generates a prompt for the OpenAI API based on the file name and content.
 * @param fileName - The name of the file.
 * @param fileContent - The content of the file.
 * @returns The generated prompt string.
 */
const generatePrompt = (fileName: string, fileContent: string): string => `
Generate 5 concise, simple tags for the file "${fileName}" based on the following content:

First 100 Lines:
${fileContent.slice(0, 500)}

Rules for tags:
1. If the content appears to be from a specific game or franchise, include the game or franchise name as one of the tags.
2. Each tag should be a lowercase single word or a short phrase (2-3 words maximum).
3. Use spaces to separate words within a tag (e.g., "tag 1" and "tag 2" are valid).
4. Tags should capture key themes, attributes, or the overall category of the file content.
5. Avoid overly specific or complex terms.
6. Do not use special characters or punctuation in tags.
7. Prioritize tags that describe the overall dataset, not individual entries.

Return only the list of 5 tags, separated by commas.
`;

/**
 * Custom hook to generate tags using the OpenAI API.
 * @param onSuccess - Callback function when tags are successfully generated.
 * @returns Mutation object with generateTags function, isLoading, and error.
 */
export function useGenerateTags(onSuccess: (tags: string[]) => void) {
  return useMutation<string[], Error, GenerateTagsParams>(
    async ({ fileName, fileContent }) => {
      const prompt = generatePrompt(fileName, fileContent);
      const result: GenerateObjectResult = await generateObject({
        model: openai('gpt-4o-2024-08-06', {
          structuredOutputs: true,
        }),
        schemaName: 'tags',
        schemaDescription: '',
        schema: tagSchema,
        prompt,
      });

      if (result?.object?.tags) {
        return result.object.tags;
      } else {
        throw new Error('Unexpected result structure');
      }
    },
    {
      onSuccess,
      onError: (error) => {
        console.error('Error generating tags:', error);
      },
    }
  );
}
