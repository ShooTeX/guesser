import { clerkClient } from "@clerk/fastify";
import { createRoomSchema, questionSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { protectedProcedure } from "../../../trpc/create-router";
import { getPlaylists } from "../../playlists/models";
import { getQuestions } from "../../questions/models";
import { roomManager } from "../interpreters";

export const createRoom = protectedProcedure
  .input(createRoomSchema)
  .mutation(async ({ ctx, input }) => {
    const [playlist] = await getPlaylists(ctx, {
      id: input.playlistId,
    });
    if (!playlist) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    const questions = await getQuestions(ctx, {
      playlistId: input.playlistId,
    });
    if (questions.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const parsedQuestions = z.array(questionSchema).safeParse(questions);

    if (!parsedQuestions.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: parsedQuestions.error.message,
      });
    }

    const user = await clerkClient.users.getUser(ctx.auth.userId);

    const id = nanoid();
    roomManager.send({
      type: "CREATE_ROOM",
      id,
      context: {
        playlistName: playlist.name,
        questions: parsedQuestions.data,
        host: {
          id: user.id,
          username: user.firstName ?? user.username ?? "",
          avatar: user.profileImageUrl,
        },
        players: [],
        currentQuestion: 0,
      },
    });

    return id;
  });
