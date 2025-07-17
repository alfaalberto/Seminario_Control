// src/ai/flows/generate-evaluation-comments.ts
'use server';

/**
 * @fileOverview Genera comentarios de evaluación para presentaciones de tesis basados en las indicaciones del profesor.
 *
 * - generateEvaluationComments - Una función que genera comentarios de evaluación.
 * - GenerateEvaluationCommentsInput - El tipo de entrada para la función generateEvaluationComments.
 * - GenerateEvaluationCommentsOutput - El tipo de retorno para la función generateEvaluationComments.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEvaluationCommentsInputSchema = z.object({
  prompt: z.string().describe('Una indicación en lenguaje natural del profesor describiendo la presentación del estudiante.'),
  semester: z.enum(['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto']).describe('El semestre de la presentación.'),
  criteria: z.string().describe('Los criterios de evaluación específicos para el semestre.'),
});
export type GenerateEvaluationCommentsInput = z.infer<typeof GenerateEvaluationCommentsInputSchema>;

const GenerateEvaluationCommentsOutputSchema = z.object({
  comments: z.string().describe('Comentarios y percepciones de evaluación generados basados en la indicación.'),
});
export type GenerateEvaluationCommentsOutput = z.infer<typeof GenerateEvaluationCommentsOutputSchema>;

export async function generateEvaluationComments(input: GenerateEvaluationCommentsInput): Promise<GenerateEvaluationCommentsOutput> {
  return generateEvaluationCommentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEvaluationCommentsPrompt',
  input: {schema: GenerateEvaluationCommentsInputSchema},
  output: {schema: GenerateEvaluationCommentsOutputSchema},
  prompt: `Eres un asistente de IA que ayuda a los profesores a evaluar las presentaciones de tesis de los estudiantes.

  Basándote en la indicación del profesor, genera comentarios y percepciones de evaluación útiles y constructivos.
  Considera el semestre y los criterios de evaluación específicos para ese semestre.

  Semestre: {{{semester}}}
  Criterios: {{{criteria}}}
  Indicación del profesor: {{{prompt}}}

  Comentarios y percepciones:`,
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
