import { playlistSchema, editPlaylistSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm/expressions";
import { protectedProcedure } from "../../../create-router";
import { playlists } from "../../../database/schemas";
import { getPlaylists } from "../models";

export const edit = protectedProcedure
  .output(playlistSchema)
  .input(editPlaylistSchema)
  .mutation(async ({ ctx, input }) => {
    await ctx.database
      .update(playlists)
      .set({ name: input.id, shortDesc: input.shortDescription })
      .where(
        and(eq(playlists.id, input.id), eq(playlists.userId, ctx.auth.userId))
      );

    const [result] = await getPlaylists(ctx, { id: input.id });

    if (!result) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      });
    }

    return result;
  });
