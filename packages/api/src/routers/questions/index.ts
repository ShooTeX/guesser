import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm/expressions";
import { nanoid } from "nanoid";
import { groupBy, map, pipe, values } from "remeda";
import { protectedProcedure, router } from "../../create-router";
import type { Answer, Question } from "../../database/schemas";
import { answers, questions, questionSchema } from "../../database/schemas";
import {
  createQuestionSchema,
  editQuestionSchema,
  getQuestionsSchema,
  removeQuestionSchema,
} from "./schemas";

const nestAnswers = (rows: { question: Question; answer: Answer | null }[]) => {
  return pipe(
    rows,
    groupBy((row) => row.question.id),
    values,
    map((group) => ({
      ...group[0].question,
      answers: group.map((item) => item.answer?.answer),
    }))
  );
};

const get = protectedProcedure
  .output(questionSchema.array())
  .input(getQuestionsSchema)
  .query(async ({ ctx, input }) => {
    const rows = await ctx.database
      .select({
        question: questions,
        answer: answers,
      })
      .from(questions)
      .leftJoin(answers, eq(answers.questionId, questions.id))
      .where(
        and(
          eq(questions.userId, ctx.auth.userId),
          ...(input.id ? [eq(questions.id, input.id)] : []),
          ...(input.playlistId
            ? [eq(questions.playlistId, input.playlistId)]
            : [])
        )
      );

    return nestAnswers(rows);
  });

export const questionsRouter = router({
  get,
  create: protectedProcedure
    .output(questionSchema)
    .input(createQuestionSchema)
    .mutation(async ({ ctx, input }) => {
      const id = nanoid();
      await ctx.database
        .insert(questions)
        .values({ ...input, id, userId: ctx.auth.userId });
      const result = await ctx.database
        .select()
        .from(questions)
        .where(
          and(eq(questions.id, id), eq(questions.userId, ctx.auth.userId))
        );

      if (!result[0]) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return { ...result[0], answers: [] };
    }),
  edit: protectedProcedure
    .output(questionSchema)
    .input(editQuestionSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.database
        .update(questions)
        .set(input.input)
        .where(
          and(eq(questions.id, input.id), eq(questions.userId, ctx.auth.userId))
        );
      const [result] = await ctx.database
        .select()
        .from(questions)
        .where(
          and(eq(questions.id, input.id), eq(questions.userId, ctx.auth.userId))
        );

      if (!result) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return result;
    }),
  delete: protectedProcedure
    .output(questionSchema.pick({ id: true }))
    .input(removeQuestionSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.database
        .delete(questions)
        .where(
          and(eq(questions.id, input.id), eq(questions.userId, ctx.auth.userId))
        );

      return { id: input.id };
    }),
});
