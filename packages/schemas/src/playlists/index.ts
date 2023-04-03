import { z } from "zod";

export const playlistSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  name: z.string(),
  shortDescription: z.string().max(200).optional(),
  createdAt: z.date(),
  questionCount: z.number(),
});

export const createPlaylistSchema = playlistSchema.pick({
  name: true,
  shortDescription: true,
});

export const editPlaylistSchema = playlistSchema.pick({
  id: true,
  name: true,
  shortDescription: true,
});

export const deletePlaylistSchema = playlistSchema.pick({ id: true });

export const getPlaylistsSchema = playlistSchema.pick({ id: true }).optional();
