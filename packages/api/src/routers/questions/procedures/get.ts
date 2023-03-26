import { protectedProcedure } from "../../../create-router";
import { questionSchema } from "../../../database/schemas";
import { getQuestions } from "../models";
import { getQuestionsSchema } from "../schemas";

export const get = protectedProcedure
  .output(questionSchema.array())
  .input(getQuestionsSchema.optional())
  .query(async ({ ctx, input }) => {
    return getQuestions(ctx, { ...input });
  });
