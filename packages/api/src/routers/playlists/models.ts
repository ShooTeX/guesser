import type { getPlaylistsSchema } from "@guesser/schemas";
import type { z } from "zod";
import type { Context } from "../../create-context";
import { and, eq } from "drizzle-orm/expressions";
import { playlists } from "../../database/schemas";

type gpContext = Context & {
  auth: {
    userId: string;
  };
};

export const getPlaylists = (
  { database, auth }: gpContext,
  input: z.infer<typeof getPlaylistsSchema>
) => {
  return database
    .select()
    .from(playlists)
    .where(
      and(
        eq(playlists.userId, auth.userId),
        ...(input?.id ? [eq(playlists.id, input?.id)] : [])
      )
    );
};
