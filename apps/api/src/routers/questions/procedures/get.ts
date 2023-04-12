import { protectedProcedure } from "@/trpc/create-router";
import { questionSchema, getQuestionsSchema } from "@guesser/schemas";
import { getQuestions } from "../models";

export const get = protectedProcedure
  .output(questionSchema.array())
  .input(getQuestionsSchema.optional())
  .query(async ({ ctx, input }) => {
    return getQuestions(ctx, { ...input });
  });