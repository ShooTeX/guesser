import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm/expressions";
import { nanoid } from "nanoid";
import { protectedProcedure, router } from "../../create-router";
import type { AnswerInsert } from "../../database/schemas";
import { answers, questions, questionSchema } from "../../database/schemas";
import { getQuestions } from "./models";
import {
  addAnswersSchema,
  createQuestionSchema,
  editQuestionSchema,
  getQuestionsSchema,
  removeQuestionSchema,
} from "./schemas";

const get = protectedProcedure
  .output(questionSchema.array())
  .input(getQuestionsSchema.optional())
  .query(async ({ ctx, input }) => {
    return getQuestions(ctx, { ...input });
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

    const [result] = await getQuestions(ctx, { id });

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

    const [result] = await getQuestions(ctx, { id: input.id });

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

    const [result] = await getQuestions(ctx, { id: questionId });

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
