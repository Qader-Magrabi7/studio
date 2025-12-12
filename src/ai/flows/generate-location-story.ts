'use server';

/**
 * @fileOverview Generates a story related to a given location using GenAI.
 *
 * - generateLocationStory - A function that generates a story for a given location.
 * - GenerateLocationStoryInput - The input type for the generateLocationStory function.
 * - GenerateLocationStoryOutput - The return type for the generateLocationStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLocationStoryInputSchema = z.object({
  location: z.string().describe('The location for which to generate a story.'),
});

export type GenerateLocationStoryInput = z.infer<
  typeof GenerateLocationStoryInputSchema
>;

const GenerateLocationStoryOutputSchema = z.object({
  title: z.string().describe('The title of the generated story.'),
  story: z.string().describe('The generated story related to the location.'),
});

export type GenerateLocationStoryOutput = z.infer<
  typeof GenerateLocationStoryOutputSchema
>;

export async function generateLocationStory(
  input: GenerateLocationStoryInput
): Promise<GenerateLocationStoryOutput> {
  return generateLocationStoryFlow(input);
}

const generateLocationStoryPrompt = ai.definePrompt({
  name: 'generateLocationStoryPrompt',
  input: {schema: GenerateLocationStoryInputSchema},
  output: {schema: GenerateLocationStoryOutputSchema},
  prompt: `You are a storyteller who crafts engaging stories related to the given location.

  Location: {{{location}}}

  Please generate a story with a title that is relevant to the location.
  The story should be a good length to read in one sitting, with multiple paragraphs.
  Focus on historical events, local legends, or interesting facts about the location.
  `,
});

const generateLocationStoryFlow = ai.defineFlow(
  {
    name: 'generateLocationStoryFlow',
    inputSchema: GenerateLocationStoryInputSchema,
    outputSchema: GenerateLocationStoryOutputSchema,
  },
  async input => {
    const {output} = await generateLocationStoryPrompt(input);
    return output!;
  }
);
