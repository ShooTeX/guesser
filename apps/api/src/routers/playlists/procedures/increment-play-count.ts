import {
  incrementPlaylistPlayCountSchema,
  playlistSchema,
} from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm/expressions";
import { playlists } from "../../../database/schemas";
import { protectedProcedure } from "../../../trpc/create-router";
import { getPlaylists } from "../models";

export const incrementPlayCount = protectedProcedure
  .output(playlistSchema)
  .input(incrementPlaylistPlayCountSchema)
  .mutation(async ({ ctx, input }) => {
    const [row] = await getPlaylists(ctx, { id: input.id });

    if (!row) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    await ctx.database
      .update(playlists)
      .set({ playCount: row.playCount + 1 })
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
