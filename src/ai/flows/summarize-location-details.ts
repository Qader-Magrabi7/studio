'use server';
/**
 * @fileOverview Summarizes key historical or cultural details of a location using GenAI.
 *
 * - summarizeLocationDetails - A function that handles the summarization process.
 * - SummarizeLocationDetailsInput - The input type for the summarizeLocationDetails function.
 * - SummarizeLocationDetailsOutput - The return type for the summarizeLocationDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLocationDetailsInputSchema = z.object({
  locationName: z.string().describe('The name of the location to summarize.'),
});
export type SummarizeLocationDetailsInput = z.infer<typeof SummarizeLocationDetailsInputSchema>;

const SummarizeLocationDetailsOutputSchema = z.object({
  summary: z.string().describe('A summary of the key historical and cultural details of the location.'),
});
export type SummarizeLocationDetailsOutput = z.infer<typeof SummarizeLocationDetailsOutputSchema>;

export async function summarizeLocationDetails(input: SummarizeLocationDetailsInput): Promise<SummarizeLocationDetailsOutput> {
  return summarizeLocationDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLocationDetailsPrompt',
  input: {schema: SummarizeLocationDetailsInputSchema},
  output: {schema: SummarizeLocationDetailsOutputSchema},
  prompt: `Summarize the key historical and cultural details of the following location: {{{locationName}}}. Provide a concise and informative summary. Focus on information that would be relevant to a visitor.
`,
});

const summarizeLocationDetailsFlow = ai.defineFlow(
  {
    name: 'summarizeLocationDetailsFlow',
    inputSchema: SummarizeLocationDetailsInputSchema,
    outputSchema: SummarizeLocationDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
