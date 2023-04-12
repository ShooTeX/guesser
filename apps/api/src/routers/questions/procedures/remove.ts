import { questions } from "@/database/schemas";
import { protectedProcedure } from "@/trpc/create-router";
import { questionSchema, removeQuestionSchema } from "@guesser/schemas";
import { and, eq } from "drizzle-orm/expressions";

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
