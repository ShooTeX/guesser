import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm/expressions";
import { protectedProcedure } from "../../../create-router";
import { questionSchema, questions } from "../../../database/schemas";
import { getQuestions } from "../models";
import { editQuestionSchema } from "../schemas";

export const edit = protectedProcedure
  .output(questionSchema)
  .input(editQuestionSchema)
  .mutation(async ({ ctx, input }) => {
    await ctx.database
      .update(questions)
      .set(input.input)
      .where(
        and(eq(questions.id, input.id), eq(questions.userId, ctx.auth.userId))
      );

    const [result] = await getQuestions(ctx, { id: input.id });

    if (!result) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return result;
  });
