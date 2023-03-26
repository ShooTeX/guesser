import { and, eq } from "drizzle-orm/expressions";
import { protectedProcedure } from "../../../create-router";
import { questionSchema, questions } from "../../../database/schemas";
import { removeQuestionSchema } from "../schemas";

export const remove = protectedProcedure
  .output(questionSchema.pick({ id: true }))
  .input(removeQuestionSchema)
  .mutation(async ({ ctx, input }) => {
    await ctx.database
      .delete(questions)
      .where(
        and(eq(questions.id, input.id), eq(questions.userId, ctx.auth.userId))
      );

    return { id: input.id };
  });
