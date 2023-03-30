import { questionSchema, createQuestionSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm/expressions";
import { nanoid } from "nanoid";
import { protectedProcedure } from "../../../create-router";
import type { AnswerInsert, QuestionInsert } from "../../../database/schemas";
import { answers } from "../../../database/schemas";
import { questions } from "../../../database/schemas";
import { getQuestions } from "../models";

const count = () => {
  return sql<number>`count(*)`;
};

export const create = protectedProcedure
  .output(questionSchema)
  .input(createQuestionSchema)
  .mutation(
    async ({ ctx, input: { answers: answersInput, ...questionInput } }) => {
      const id = nanoid();

      const [countSelect] = await ctx.database
        .select({ count: count() })
        .from(questions)
        .where(eq(questions.playlistId, questionInput.playlistId));

      await ctx.database.insert(questions).values({
        id: id,
        userId: ctx.auth.userId,
        order: countSelect?.count || 0,
        ...questionInput,
      } satisfies QuestionInsert);

      const answersWithIds = answersInput.map(
        ({ answer, correct }) =>
          ({
            answer,
            correct,
            questionId: id,
            id: nanoid(),
            userId: ctx.auth.userId,
          } satisfies AnswerInsert)
      );

      await ctx.database.insert(answers).values(answersWithIds);

      const [result] = await getQuestions(ctx, { id });

      if (!result) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return result;
    }
  );
