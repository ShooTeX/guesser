import { z } from "zod";
import { questionSchema } from "../../../database/schemas";

export const getQuestionsSchema = z.intersection(
  questionSchema.pick({ id: true }),
  questionSchema.pick({ playlistId: true }).partial()
);

export const createQuestionSchema = questionSchema.pick({
  playlistId: true,
  question: true,
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
