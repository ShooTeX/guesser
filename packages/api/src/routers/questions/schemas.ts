import { questionSchema, answerSchema } from "../../database/schemas";

export const getQuestionsSchema = questionSchema
  .pick({ id: true, playlistId: true })
  .partial();

export const createQuestionSchema = questionSchema.pick({
  playlistId: true,
  question: true,
  answers: true,
});

export const removeQuestionSchema = questionSchema.pick({
  id: true,
});

export const editQuestionSchema = questionSchema
  .pick({
    id: true,
  })
  .extend({
    input: questionSchema.pick({ question: true }),
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
