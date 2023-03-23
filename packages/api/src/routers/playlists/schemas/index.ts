import { playlistSchema, questionSchema } from "../../../database/schemas";

export const createPlaylistSchema = playlistSchema.pick({ name: true }).extend({
  questions: questionSchema.pick({ question: true }).array().optional(),
});

export const editPlaylistSchema = playlistSchema.pick({ id: true }).extend({
  input: createPlaylistSchema,
});

export const deletePlaylistSchema = playlistSchema.pick({ id: true });

export const getPlaylistsSchema = playlistSchema.pick({ id: true });
