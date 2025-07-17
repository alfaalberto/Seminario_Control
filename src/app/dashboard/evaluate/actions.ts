"use server";

import { generateEvaluationComments, type GenerateEvaluationCommentsInput } from "@/ai/flows/generate-evaluation-comments";
import { z } from "zod";

const actionSchema = z.object({
  prompt: z.string().min(1, { message: 'Prompt cannot be empty.' }),
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
    return { error: 'Invalid input.' };
  }

  const semesterEnum = z.enum(['First', 'Second', 'Third', 'Fourth', 'Fifth']);
  const parsedSemester = semesterEnum.safeParse(validationResult.data.semester);

  if (!parsedSemester.success) {
    return { error: 'Invalid semester provided.' };
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
    return { error: 'An unexpected error occurred while generating comments.' };
  }
}
