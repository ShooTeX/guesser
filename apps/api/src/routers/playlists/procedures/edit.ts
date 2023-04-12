import { playlists } from "@/database/schemas";
import { protectedProcedure } from "@/trpc/create-router";
import { playlistSchema, editPlaylistSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm/expressions";
import { getPlaylists } from "../models";

export const edit = protectedProcedure
  .output(playlistSchema)
  .input(editPlaylistSchema)
  .mutation(async ({ ctx, input }) => {
    await ctx.database
      .update(playlists)
      .set({ name: input.name, shortDesc: input.shortDesc })
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
