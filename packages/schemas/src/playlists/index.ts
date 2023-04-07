import { z } from "zod";

export const playlistSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  name: z.string(),
  shortDesc: z
    .string()
    .max(200)
    .nullish()
    .transform((value) => value ?? undefined),
  createdAt: z.string(),
  questionCount: z.coerce.number().finite().nonnegative(),
  playCount: z.number().finite().nonnegative(),
});

export const createPlaylistSchema = playlistSchema.pick({
  name: true,
  shortDesc: true,
});

export const editPlaylistSchema = playlistSchema.pick({
  id: true,
  name: true,
  shortDesc: true,
});

export const deletePlaylistSchema = playlistSchema.pick({ id: true });

export const getPlaylistsSchema = playlistSchema.pick({ id: true }).optional();

export const incrementPlaylistPlayCountSchema = playlistSchema.pick({
  id: true,
});
