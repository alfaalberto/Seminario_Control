// src/ai/flows/generate-evaluation-comments.ts
'use server';

/**
 * @fileOverview Genera comentarios de evaluación para presentaciones del Seminario Departamental basados en las indicaciones del profesor y el reglamento.
 *
 * - generateEvaluationComments - Una función que genera comentarios de evaluación.
 * - GenerateEvaluationCommentsInput - El tipo de entrada para la función generateEvaluationComments.
 * - GenerateEvaluationCommentsOutput - El tipo de retorno para la función generateEvaluationComments.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEvaluationCommentsInputSchema = z.object({
  prompt: z.string().describe('Una indicación en lenguaje natural del profesor describiendo la presentación del estudiante.'),
  semester: z.enum(['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto']).describe('El semestre del estudiante.'),
  criteria: z.string().describe('Los criterios de evaluación y reglas del seminario.'),
});
export type GenerateEvaluationCommentsInput = z.infer<typeof GenerateEvaluationCommentsInputSchema>;

const GenerateEvaluationCommentsOutputSchema = z.object({
  comments: z.string().describe('Comentarios y percepciones de evaluación generados basados en la indicación y el reglamento.'),
});
export type GenerateEvaluationCommentsOutput = z.infer<typeof GenerateEvaluationCommentsOutputSchema>;

export async function generateEvaluationComments(input: GenerateEvaluationCommentsInput): Promise<GenerateEvaluationCommentsOutput> {
  return generateEvaluationCommentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEvaluationCommentsPrompt',
  input: {schema: GenerateEvaluationCommentsInputSchema},
  output: {schema: GenerateEvaluationCommentsOutputSchema},
  prompt: `Eres un asistente de IA que ayuda a los profesores del programa de Maestría en Ciencias en Ingeniería Electrónica a evaluar las presentaciones de tesis de los estudiantes en el Seminario Departamental.

  Basándote en la indicación del profesor y el reglamento del seminario, genera comentarios y percepciones de evaluación útiles y constructivos.
  La evaluación se basa en una escala de 0 a 10.

  Reglamento y Criterios a considerar:
  {{{criteria}}}

  Contexto:
  - Semestre del estudiante: {{{semester}}}
  - Indicación del profesor: {{{prompt}}}

  Genera los comentarios y percepciones aquí:`,
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