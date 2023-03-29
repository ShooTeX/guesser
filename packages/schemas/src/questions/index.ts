import { z } from "zod";

export const answerSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  answer: z.string().min(1),
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
    order: true,
  })
  .extend({
    answers: answerSchema.pick({ answer: true, correct: true }).array().min(2),
  });

export const removeQuestionSchema = questionSchema.pick({
  id: true,
});

export const editQuestionSchema = questionSchema
  .pick({
    id: true,
  })
  .extend({
    input: z.intersection(
      questionSchema.pick({ question: true }),
      questionSchema.pick({ order: true }).optional()
    ),
  });

export const addAnswersSchema = answerSchema
  .pick({
    questionId: true,
  })
  .extend({
    input: answerSchema.shape.answer.array().min(1),
  });

export const removeAnswerSchema = answerSchema.pick({
  id: true,
});

export const editAnswerSchema = answerSchema
  .pick({
    id: true,
  })
  .extend({ input: answerSchema.pick({ answer: true }) });
