"use server";

import { generateEvaluationComments, type GenerateEvaluationCommentsInput } from "@/ai/flows/generate-evaluation-comments";
import { z } from "zod";

const actionSchema = z.object({
  prompt: z.string().min(1, { message: 'La indicación no puede estar vacía.' }),
  semester: z.string(),
  criteria: z.string(),
});

export async function getAIComments(formData: FormData) {
  const rawInput = {
    prompt: formData.get('prompt'),
    semester: formData.get('semester'),
    criteria: formData.get('criteria'),
  };

  const validationResult = actionSchema.safeParse(rawInput);
  if (!validationResult.success) {
    return { error: 'Entrada inválida.' };
  }

  const semesterEnum = z.enum(['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto']);
  const parsedSemester = semesterEnum.safeParse(validationResult.data.semester);

  if (!parsedSemester.success) {
    return { error: 'Semestre proporcionado inválido.' };
  }

  const aiInput: GenerateEvaluationCommentsInput = {
    prompt: validationResult.data.prompt,
    semester: parsedSemester.data,
    criteria: validationResult.data.criteria,
  };

  try {
    const result = await generateEvaluationComments(aiInput);
    return { comments: result.comments };
  } catch (e) {
    console.error(e);
    return { error: 'Ocurrió un error inesperado al generar los comentarios.' };
  }
}
