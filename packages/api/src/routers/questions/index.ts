import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm/expressions";
import { nanoid } from "nanoid";
import { protectedProcedure, router } from "../../create-router";
import { questions, questionSchema } from "../../database/schemas";
import {
  createQuestionSchema,
  editQuestionSchema,
  getQuestionsSchema,
  removeQuestionSchema,
} from "./schemas";

export const questionsRouter = router({
  get: protectedProcedure
    .output(questionSchema.array())
    .input(getQuestionsSchema)
    .query(({ ctx, input }) => {
      return ctx.database
        .select()
        .from(questions)
        .where(
          and(
            eq(questions.id, input.id),
            eq(questions.userId, ctx.auth.userId),
            ...(input.playlistId
              ? [eq(questions.playlistId, input.playlistId)]
              : [])
          )
        );
    }),
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

      return result[0];
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
      const result = await ctx.database
        .select()
        .from(questions)
        .where(
          and(eq(questions.id, input.id), eq(questions.userId, ctx.auth.userId))
        );

      if (!result[0]) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return result[0];
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
