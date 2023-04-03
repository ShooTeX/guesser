import { playlistSchema, getPlaylistsSchema } from "@guesser/schemas";
import { z } from "zod";
import { protectedProcedure } from "../../../create-router";
import { getPlaylists } from "../models";

export const get = protectedProcedure
  .output(z.array(playlistSchema))
  .input(getPlaylistsSchema)
  .query(({ ctx, input }) => {
    return getPlaylists(ctx, input);
  });
