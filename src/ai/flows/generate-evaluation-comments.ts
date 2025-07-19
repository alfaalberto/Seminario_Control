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
  criteria: z.string().describe('Los criterios de evaluación y sus pesos para el semestre correspondiente.'),
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
  prompt: `Eres un asistente de IA experto que ayuda a los profesores del programa de Maestría en Ciencias en Ingeniería Electrónica a evaluar las presentaciones de tesis de los estudiantes en el Seminario Departamental.

Tu tarea es generar comentarios de evaluación constructivos y detallados. Debes basarte en la indicación proporcionada por el profesor, el semestre del estudiante y los criterios de evaluación específicos para ese semestre.

La evaluación se califica en una escala de 0 a 10.

**Contexto de la Evaluación:**
- **Semestre del estudiante:** {{{semester}}}
- **Indicación del profesor:** {{{prompt}}}

**Reglamento y Criterios a considerar para el semestre en curso:**
{{{criteria}}}

**Instrucciones:**
1.  Analiza la indicación del profesor en el contexto del semestre y los criterios de evaluación.
2.  Genera comentarios que sean específicos, constructivos y estén directamente relacionados con los criterios mencionados.
3.  Si la indicación del profesor es breve, extrapola posibles fortalezas y debilidades basándote en los criterios del semestre. Por ejemplo, si el estudiante está en primer semestre y el profesor dice "le falta claridad", puedes inferir que esto afecta a la "Definición del Problema" y la "Hipótesis".
4.  Mantén un tono profesional y académico.

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
