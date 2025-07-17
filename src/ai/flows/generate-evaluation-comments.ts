// src/ai/flows/generate-evaluation-comments.ts
'use server';

/**
 * @fileOverview Generates evaluation comments for thesis presentations based on professor prompts.
 *
 * - generateEvaluationComments - A function that generates evaluation comments.
 * - GenerateEvaluationCommentsInput - The input type for the generateEvaluationComments function.
 * - GenerateEvaluationCommentsOutput - The return type for the generateEvaluationComments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEvaluationCommentsInputSchema = z.object({
  prompt: z.string().describe('A natural language prompt from the professor describing the student\'s presentation.'),
  semester: z.enum(['First', 'Second', 'Third', 'Fourth', 'Fifth']).describe('The semester of the presentation.'),
  criteria: z.string().describe('The specific evaluation criteria for the semester.'),
});
export type GenerateEvaluationCommentsInput = z.infer<typeof GenerateEvaluationCommentsInputSchema>;

const GenerateEvaluationCommentsOutputSchema = z.object({
  comments: z.string().describe('Generated evaluation comments and insights based on the prompt.'),
});
export type GenerateEvaluationCommentsOutput = z.infer<typeof GenerateEvaluationCommentsOutputSchema>;

export async function generateEvaluationComments(input: GenerateEvaluationCommentsInput): Promise<GenerateEvaluationCommentsOutput> {
  return generateEvaluationCommentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEvaluationCommentsPrompt',
  input: {schema: GenerateEvaluationCommentsInputSchema},
  output: {schema: GenerateEvaluationCommentsOutputSchema},
  prompt: `You are an AI assistant helping professors evaluate student thesis presentations.

  Based on the professor's prompt, generate helpful and constructive evaluation comments and insights.
  Consider the semester and the specific evaluation criteria for that semester.

  Semester: {{{semester}}}
  Criteria: {{{criteria}}}
  Professor's Prompt: {{{prompt}}}

  Comments and Insights:`,
});

const generateEvaluationCommentsFlow = ai.defineFlow(
  {
    name: 'generateEvaluationCommentsFlow',
    inputSchema: GenerateEvaluationCommentsInputSchema,
    outputSchema: GenerateEvaluationCommentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
