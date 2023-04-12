import type { getPlaylistsSchema } from "@guesser/schemas";
import type { z } from "zod";
import { and, eq } from "drizzle-orm/expressions";
import { questions, playlists } from "@/database/schemas";
import { countQuery } from "@/utils/count-query";
import type { Context } from "@/trpc/create-context";

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
    .groupBy(questions.playlistId)
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
        ...(input?.id ? [eq(playlists.id, input.id)] : [])
      )
    );

  const test = results.map(({ playlist, questionCount }) => ({
    ...playlist,
    questionCount,
  }));

  return test;
};
