'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligently reasoning about
 * occupancy counts based on entrance and exit data.
 *
 * - reasonAboutOccupancy - A function that takes raw entrance and exit counts and returns a stable,
 *   accurate occupancy count.
 * - ReasonAboutOccupancyInput - The input type for the reasonAboutOccupancy function.
 * - ReasonAboutOccupancyOutput - The return type for the reasonAboutOccupancy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasonAboutOccupancyInputSchema = z.object({
  entranceCount: z
    .number()
    .describe('The number of people detected entering the washroom.'),
  exitCount: z
    .number()
    .describe('The number of people detected exiting the washroom.'),
  previousOccupancy: z
    .number()
    .describe('The previous occupancy count before the current readings.'),
  threshold: z
    .number()
    .describe('The maximum occupancy threshold for the washroom.'),
});
export type ReasonAboutOccupancyInput = z.infer<typeof ReasonAboutOccupancyInputSchema>;

const ReasonAboutOccupancyOutputSchema = z.object({
  occupancy: z
    .number()
    .describe(
      'The reasoned and stable occupancy count, adjusted for potential sensor errors.'
    ),
  isThresholdBreached: z
    .boolean()
    .describe(
      'Whether the occupancy count has breached the defined threshold, indicating overcrowding.'
    ),
  reasoning: z
    .string()
    .describe(
      'The explanation of how the LLM reasoned about sensor data to determine the final occupancy.'
    ),
});
export type ReasonAboutOccupancyOutput = z.infer<typeof ReasonAboutOccupancyOutputSchema>;

export async function reasonAboutOccupancy(
  input: ReasonAboutOccupancyInput
): Promise<ReasonAboutOccupancyOutput> {
  return reasonAboutOccupancyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasonAboutOccupancyPrompt',
  input: {schema: ReasonAboutOccupancyInputSchema},
  output: {schema: ReasonAboutOccupancyOutputSchema},
  prompt: `You are an expert in managing and interpreting sensor data for washroom occupancy.

You are given the number of people entering (entranceCount), the number of people exiting (exitCount),
the previous occupancy count (previousOccupancy), and the maximum occupancy threshold (threshold).

Your task is to calculate the current occupancy, taking into account potential sensor errors or inconsistencies.
Provide a final occupancy count and whether the threshold has been breached. Also explain the reasoning.

Entrance Count: {{{entranceCount}}}
Exit Count: {{{exitCount}}}
Previous Occupancy: {{{previousOccupancy}}}
Occupancy Threshold: {{{threshold}}}

Consider these factors:
- Sensor errors: Sensors can sometimes miscount or double-count individuals.
- Inconsistencies: There might be discrepancies between entrance and exit counts over short periods.

Reasoning about occupancy:
1. Calculate the raw occupancy change: entranceCount - exitCount.
2. Apply the change to the previous occupancy: previousOccupancy + (entranceCount - exitCount).
3. If the result is negative, set the occupancy to 0. Occupancy cannot be negative.
4. If the calculated occupancy exceeds the threshold, then isThresholdBreached should be true, otherwise it should be false.
5. Explain the adjustments made, if any, due to potential sensor errors or inconsistencies.
6. Return a JSON object with the final occupancy, isThresholdBreached, and reasoning.
`,
});

const reasonAboutOccupancyFlow = ai.defineFlow(
  {
    name: 'reasonAboutOccupancyFlow',
    inputSchema: ReasonAboutOccupancyInputSchema,
    outputSchema: ReasonAboutOccupancyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
