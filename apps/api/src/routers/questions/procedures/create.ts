import type { QuestionInsert, AnswerInsert } from "@/database/schemas";
import { questions, answers } from "@/database/schemas";
import { protectedProcedure } from "@/trpc/create-router";
import { countQuery } from "@/utils/count-query";
import { questionSchema, createQuestionSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm/expressions";
import { nanoid } from "nanoid";
import { getQuestions } from "../models";

export const create = protectedProcedure
  .output(questionSchema)
  .input(createQuestionSchema)
  .mutation(
    async ({ ctx, input: { answers: answersInput, ...questionInput } }) => {
      const id = nanoid();

      const [countSelect] = await ctx.database
        .select({ count: countQuery() })
        .from(questions)
        .where(eq(questions.playlistId, questionInput.playlistId));

      await ctx.database.insert(questions).values({
        id: id,
        userId: ctx.auth.userId,
        order: countSelect?.count ?? 0,
        ...questionInput,
      } satisfies QuestionInsert);

      const answersWithIds = answersInput.map(
        ({ answer, correct }, index) =>
          ({
            answer,
            correct,
            order: index,
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
