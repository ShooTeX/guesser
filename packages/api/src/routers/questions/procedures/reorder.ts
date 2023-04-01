import { questionSchema, reorderQuestionSchema } from "@guesser/schemas";
import { and, eq, gte } from "drizzle-orm/expressions";
import { protectedProcedure } from "../../../create-router";
import { questions } from "../../../database/schemas";

export const reorder = protectedProcedure
  .output(questionSchema.pick({ order: true, id: true }).array())
  .input(reorderQuestionSchema)
  .mutation(async ({ ctx, input }) => {
    const affectedRows = await ctx.database
      .select({
        id: questions.id,
        order: questions.order,
      })
      .from(questions)
      .where(
        and(
          eq(questions.playlistId, input.playlistId),
          eq(questions.userId, ctx.auth.userId),
          gte(questions.order, input.order)
        )
      );

    const updatedRows = [
      ...affectedRows.map((row) => ({
        id: row.id,
        order: row.order + 1,
      })),
      input,
    ];

    for (const row of updatedRows) {
      await ctx.database
        .update(questions)
        .set({ order: row.order })
        .where(
          and(eq(questions.id, row.id), eq(questions.userId, ctx.auth.userId))
        );
    }

    return updatedRows;
  });
