import { nextPlaylistSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../../trpc/create-router";
import { getPlaylists } from "../../playlists/models";
import { getQuestions } from "../../questions/models";
import { roomManager } from "../interpreters";

export const nextPlaylist = protectedProcedure
  .input(nextPlaylistSchema)
  .mutation(async ({ ctx, input }) => {
    const roomSnapshot = roomManager
      .getSnapshot()
      .context.rooms.get(input.roomId)
      ?.getSnapshot();

    if (!roomSnapshot) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Room was not found" });
    }

    if (ctx.auth.userId !== roomSnapshot.context.host.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User is not host",
      });
    }

    const [playlist] = await getPlaylists(ctx, {
      id: input.playlistId,
    });

    if (!playlist) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Playlist was not found",
      });
    }
    const questions = await getQuestions(ctx, {
      playlistId: input.playlistId,
    });

    if (questions.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Playlist has no questions",
      });
    }

    roomManager.send({
      type: "NEXT_PLAYLIST_IN_ROOM",
      roomId: input.roomId,
      questions,
      playlistName: playlist.name,
    });
  });
