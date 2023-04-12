import { playlists } from "@/database/schemas";
import { protectedProcedure } from "@/trpc/create-router";
import { playlistSchema, deletePlaylistSchema } from "@guesser/schemas";
import { and, eq } from "drizzle-orm/expressions";

export const remove = protectedProcedure
  .output(playlistSchema.pick({ id: true }))
  .input(deletePlaylistSchema)
  .mutation(async ({ ctx, input }) => {
    await ctx.database
      .delete(playlists)
      .where(
        and(eq(playlists.id, input.id), eq(playlists.userId, ctx.auth.userId))
      );

    return { id: input.id };
  });
