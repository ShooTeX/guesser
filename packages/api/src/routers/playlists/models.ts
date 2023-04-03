import type { getPlaylistsSchema } from "@guesser/schemas";
import type { z } from "zod";
import type { Context } from "../../create-context";
import { and, eq } from "drizzle-orm/expressions";
import { playlists, questions } from "../../database/schemas";
import { countQuery } from "../../lib/count-query";

type gpContext = Context & {
  auth: {
    userId: string;
  };
};

export const getPlaylists = async (
  { database, auth }: gpContext,
  input: z.infer<typeof getPlaylistsSchema>
) => {
  const sq = database
    .select({
      count: countQuery().as("count"),
      playlistId: questions.playlistId,
    })
    .from(questions)
    .as("sq");

  const results = await database
    .select({
      playlist: playlists,
      questionCount: sq.count,
    })
    .from(playlists)
    .leftJoin(sq, eq(sq.playlistId, playlists.id))
    .where(
      and(
        eq(playlists.userId, auth.userId),
        ...(input?.id ? [eq(playlists.id, input?.id)] : [])
      )
    );

  return results.map(({ playlist, questionCount }) => ({
    ...playlist,
    questionCount,
  }));
};
