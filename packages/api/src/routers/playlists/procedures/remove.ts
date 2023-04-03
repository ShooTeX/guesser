import { playlistSchema, deletePlaylistSchema } from "@guesser/schemas";
import { and, eq } from "drizzle-orm/expressions";
import { protectedProcedure } from "../../../create-router";
import { playlists } from "../../../database/schemas";

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
