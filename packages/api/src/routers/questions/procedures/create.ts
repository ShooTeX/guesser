import { questionSchema, createQuestionSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
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
      const questionRow = await ctx.database.insert(questions).values({
        id: id,
        userId: ctx.auth.userId,
        ...questionInput,
      } satisfies QuestionInsert);

      console.log(questionRow.rowsAffected);

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
