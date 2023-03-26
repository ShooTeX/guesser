import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { protectedProcedure } from "../../../create-router";
import type { AnswerInsert } from "../../../database/schemas";
import { questionSchema, answers } from "../../../database/schemas";
import { getQuestions } from "../models";
import { addAnswersSchema } from "../schemas";

export const addAnswers = protectedProcedure
  .output(questionSchema)
  .input(addAnswersSchema)
  .mutation(async ({ ctx, input: { questionId, input } }) => {
    const answersWithIds = input.map(
      (answer) =>
        ({
          questionId,
          answer,
          id: nanoid(),
          userId: ctx.auth.userId,
        } satisfies AnswerInsert)
    );
    await ctx.database.insert(answers).values(...answersWithIds);

    const [result] = await getQuestions(ctx, { id: questionId });

    if (!result) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return result;
  });
