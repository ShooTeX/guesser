import { editQuestionSchema, questionSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm/expressions";
import { questions, answers } from "../../../database/schemas";
import { protectedProcedure } from "../../../trpc/create-router";
import { getQuestions } from "../models";

export const edit = protectedProcedure
  .output(questionSchema)
  .input(editQuestionSchema)
  .mutation(
    async ({ ctx, input: { answers: answersInput, ...questionInput } }) => {
      await ctx.database
        .update(questions)
        .set({
          id: questionInput.id,
          question: questionInput.question,
          markdown: questionInput.markdown,
        })
        .where(
          and(
            eq(questions.id, questionInput.id),
            eq(questions.userId, ctx.auth.userId)
          )
        );

      if (answersInput) {
        answersInput.map(
          async (answer) =>
            await ctx.database
              .update(answers)
              .set(answer)
              .where(
                and(
                  eq(answers.id, answer.id),
                  eq(answers.userId, ctx.auth.userId)
                )
              )
        );
      }

      const [result] = await getQuestions(ctx, { id: questionInput.id });

      if (!result) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      return result;
    }
  );
