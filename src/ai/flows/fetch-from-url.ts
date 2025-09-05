'use server';

/**
 * @fileOverview A Genkit flow for fetching data from a URL.
 *
 * - fetchFromUrl - A function that takes a URL and returns the fetched data.
 * - FetchFromUrlInput - The input type for the fetchFromUrl function.
 * - FetchFromUrlOutput - The return type for the fetchFromUrl function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FetchFromUrlInputSchema = z.object({
  url: z.string().url().describe('The URL to fetch data from.'),
});
export type FetchFromUrlInput = z.infer<typeof FetchFromUrlInputSchema>;

const FetchFromUrlOutputSchema = z.object({
  data: z.any().describe('The data fetched from the URL.'),
});
export type FetchFromUrlOutput = z.infer<typeof FetchFromUrlOutputSchema>;

export async function fetchFromUrl(
  input: FetchFromUrlInput
): Promise<FetchFromUrlOutput> {
  return fetchFromUrlFlow(input);
}

const fetchFromUrlFlow = ai.defineFlow(
  {
    name: 'fetchFromUrlFlow',
    inputSchema: FetchFromUrlInputSchema,
    outputSchema: FetchFromUrlOutputSchema,
  },
  async ({url}) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch from ${url}: ${response.statusText}`);
      }
      const data = await response.json();
      return {data};
    } catch (error) {
      console.error('Error fetching from URL:', error);
      throw new Error('Failed to fetch or parse data from the provided URL.');
    }
  }
);
