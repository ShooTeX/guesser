import { questions } from "@/database/schemas";
import { protectedProcedure } from "@/trpc/create-router";
import { questionSchema, reorderQuestionSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { and, eq, gt, gte, lt, lte } from "drizzle-orm/expressions";

export const reorder = protectedProcedure
  .output(questionSchema.pick({ order: true, id: true }).array())
  .input(reorderQuestionSchema)
  .mutation(async ({ ctx, input }) => {
    const [currentRow] = await ctx.database
      .select({ id: questions.id, order: questions.order })
      .from(questions)
      .where(
        and(
          and(eq(questions.id, input.id), eq(questions.userId, ctx.auth.userId))
        )
      );

    if (!currentRow) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    if (currentRow.order === input.order) {
      return [input];
    }

    const affectedRows = await ctx.database
      .select({
        id: questions.id,
        order: questions.order,
      })
      .from(questions)
      .where(
        and(
          ...(input.order > currentRow.order
            ? [
                and(
                  lte(questions.order, input.order),
                  gt(questions.order, currentRow.order)
                ),
              ]
            : [
                and(
                  gte(questions.order, input.order),
                  lt(questions.order, currentRow.order)
                ),
              ]),
          eq(questions.playlistId, input.playlistId),
          eq(questions.userId, ctx.auth.userId)
        )
      );

    const updatedRows =
      input.order > currentRow.order
        ? [
            ...affectedRows.map((row) => ({
              id: row.id,
              order: row.order - 1,
            })),
            input,
          ]
        : [
            input,
            ...affectedRows.map((row) => ({
              id: row.id,
              order: row.order + 1,
            })),
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
