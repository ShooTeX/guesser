import { z } from "znv";
import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm/expressions";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../create-router";
import { playlists } from "../database/schema";

export const playlistSchema = z.object({
  id: z.string().length(21),
  userId: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
});

export const createPlaylistSchema = playlistSchema.pick({ name: true });

export const editPlaylistSchema = playlistSchema.pick({ id: true }).extend({
  input: createPlaylistSchema,
});

export const deletePlaylistSchema = playlistSchema.pick({ id: true });

export const getPlaylistsSchema = playlistSchema.pick({ id: true });

export const playlistsRouter = router({
  get: protectedProcedure
    .output(z.array(playlistSchema))
    .input(getPlaylistsSchema.optional())
    .query(({ ctx, input }) => {
      return ctx.database
        .select()
        .from(playlists)
        .where(
          and(
            eq(playlists.userId, ctx.auth.userId),
            ...(input?.id ? [eq(playlists.id, input.id)] : [])
          )
        );
    }),
  create: protectedProcedure
    .output(playlistSchema)
    .input(createPlaylistSchema)
    .query(async ({ ctx, input }) => {
      const id = nanoid();

      await ctx.database.insert(playlists).values({
        userId: ctx.auth.userId,
        id,
        name: input.name,
      });

      const result = await ctx.database
        .select()
        .from(playlists)
        .where(
          and(eq(playlists.id, id), eq(playlists.userId, ctx.auth.userId))
        );

      if (!result[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        });
      }

      return result[0];
    }),
  edit: protectedProcedure
    .output(playlistSchema)
    .input(editPlaylistSchema)
    .query(async ({ ctx, input }) => {
      await ctx.database
        .update(playlists)
        .set(input.input)
        .where(
          and(eq(playlists.id, input.id), eq(playlists.userId, ctx.auth.userId))
        );

      const result = await ctx.database
        .select()
        .from(playlists)
        .where(
          and(eq(playlists.id, input.id), eq(playlists.userId, ctx.auth.userId))
        );

      if (!result[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred.",
        });
      }

      return result[0];
    }),
  delete: protectedProcedure
    .output(playlistSchema.pick({ id: true }))
    .input(deletePlaylistSchema)
    .query(async ({ ctx, input }) => {
      await ctx.database
        .delete(playlists)
        .where(
          and(eq(playlists.id, input.id), eq(playlists.userId, ctx.auth.userId))
        );

      return { id: input.id };
    }),
});
