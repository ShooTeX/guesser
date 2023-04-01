import { z } from "zod";

export const answerSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  answer: z.string().min(1),
  order: z.number().finite().nonnegative().min(0).max(32_767),
  correct: z.boolean().default(false),
  questionId: z.string().length(21),
  createdAt: z.date(),
});

export const questionSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  question: z.string().min(1),
  order: z.number().finite().nonnegative().min(0).max(32_767),
  playlistId: z.string().length(21),
  createdAt: z.date(),
  answers: answerSchema.array().min(2),
});

export const getQuestionsSchema = questionSchema
  .pick({ id: true, playlistId: true })
  .partial();

export const createQuestionSchema = questionSchema
  .pick({
    playlistId: true,
    question: true,
    answers: true,
  })
  .extend({
    answers: answerSchema.pick({ answer: true, correct: true }).array().min(2),
  });

export const removeQuestionSchema = questionSchema.pick({
  id: true,
});

export const editQuestionSchema = questionSchema
  .pick({ id: true, question: true })
  .extend({
    answers: z.optional(
      answerSchema.pick({ id: true, answer: true, correct: true }).array()
    ),
  });

export const reorderQuestionSchema = questionSchema.pick({
  id: true,
  playlistId: true,
  order: true,
});
