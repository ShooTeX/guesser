import { playlists } from "@/database/schemas";
import { protectedProcedure } from "@/trpc/create-router";
import { playlistSchema, createPlaylistSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { getPlaylists } from "../models";

export const create = protectedProcedure
  .output(playlistSchema)
  .input(createPlaylistSchema)
  .mutation(async ({ ctx, input }) => {
    const id = nanoid();

    await ctx.database.insert(playlists).values({
      userId: ctx.auth.userId,
      id,
      name: input.name,
      shortDesc: input.shortDesc,
    });

    const [result] = await getPlaylists(ctx, { id });

    if (!result) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      });
    }

    return result;
  });
