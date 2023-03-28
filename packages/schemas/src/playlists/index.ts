import { z } from "zod";
import { questionSchema } from "../questions";

export const playlistSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  name: z.string(),
  createdAt: z.date(),
});

export const createPlaylistSchema = playlistSchema.pick({ name: true }).extend({
  questions: questionSchema.pick({ question: true }).array().optional(),
});

export const editPlaylistSchema = playlistSchema.pick({ id: true }).extend({
  input: createPlaylistSchema,
});

export const deletePlaylistSchema = playlistSchema.pick({ id: true });

export const getPlaylistsSchema = playlistSchema.pick({ id: true });
