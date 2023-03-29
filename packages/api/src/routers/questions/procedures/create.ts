import { questionSchema, createQuestionSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { protectedProcedure } from "../../../create-router";
import type { AnswerInsert } from "../../../database/schemas";
import { questions, answers } from "../../../database/schemas";
import { getQuestions } from "../models";

export const create = protectedProcedure
  .output(questionSchema)
  .input(createQuestionSchema)
  .mutation(async ({ ctx, input }) => {
    const id = nanoid();
    await ctx.database
      .insert(questions)
      .values({ ...input, id, userId: ctx.auth.userId });

    const answersWithIds = input.answers.map(
      ({ answer, correct }) =>
        ({
          answer,
          correct,
          questionId: id,
          id: nanoid(),
          userId: ctx.auth.userId,
        } satisfies AnswerInsert)
    );

    await ctx.database.insert(answers).values(...answersWithIds);

    const [result] = await getQuestions(ctx, { id });

    if (!result) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return result;
  });
