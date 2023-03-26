import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm/expressions";
import { nanoid } from "nanoid";
import { compact, groupBy, map, pipe, values } from "remeda";
import { protectedProcedure, router } from "../../create-router";
import type { Answer, AnswerInsert, Question } from "../../database/schemas";
import { answers, questions, questionSchema } from "../../database/schemas";
import {
  addAnswersSchema,
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
      answers: compact(group.map((item) => item.answer?.answer)),
    }))
  );
};

const get = protectedProcedure
  .output(questionSchema.array())
  .input(getQuestionsSchema.optional())
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
          ...(input?.id ? [eq(questions.id, input.id)] : []),
          ...(input?.playlistId
            ? [eq(questions.playlistId, input.playlistId)]
            : [])
        )
      );

    return nestAnswers(rows);
  });

const create = protectedProcedure
  .output(questionSchema)
  .input(createQuestionSchema)
  .mutation(async ({ ctx, input }) => {
    const id = nanoid();
    await ctx.database
      .insert(questions)
      .values({ ...input, id, userId: ctx.auth.userId });

    const answersWithIds = input.answers.map(
      (answer) =>
        ({
          answer,
          questionId: id,
          id: nanoid(),
          userId: ctx.auth.userId,
        } satisfies AnswerInsert)
    );
    await ctx.database.insert(answers).values(...answersWithIds);

    const rows = await ctx.database
      .select({
        question: questions,
        answer: answers,
      })
      .from(questions)
      .leftJoin(answers, eq(answers.questionId, questions.id))
      .where(and(eq(questions.id, id), eq(questions.userId, ctx.auth.userId)));

    const [result] = nestAnswers(rows);

    if (!result) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return result;
  });

const edit = protectedProcedure
  .output(questionSchema)
  .input(editQuestionSchema)
  .mutation(async ({ ctx, input }) => {
    await ctx.database
      .update(questions)
      .set(input.input)
      .where(
        and(eq(questions.id, input.id), eq(questions.userId, ctx.auth.userId))
      );
    // TODO: extract to function
    const rows = await ctx.database
      .select({
        question: questions,
        answer: answers,
      })
      .from(questions)
      .leftJoin(answers, eq(answers.questionId, questions.id))
      .where(
        and(eq(questions.id, input.id), eq(questions.userId, ctx.auth.userId))
      );

    const [result] = nestAnswers(rows);

    if (!result) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return result;
  });

const addAnswers = protectedProcedure
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

    const rows = await ctx.database
      .select({
        question: questions,
        answer: answers,
      })
      .from(questions)
      .leftJoin(answers, eq(answers.questionId, questions.id))
      .where(
        and(eq(questions.id, questionId), eq(questions.userId, ctx.auth.userId))
      );

    const [result] = nestAnswers(rows);

    if (!result) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    return result;
  });

export const questionsRouter = router({
  get,
  create,
  addAnswers,
  edit,
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
