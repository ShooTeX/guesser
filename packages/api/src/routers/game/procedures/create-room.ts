import { clerkClient } from "@clerk/fastify";
import { createRoomSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { protectedProcedure } from "../../../create-router";
import { getQuestions } from "../../questions/models";
import { roomManager } from "../interpreters";

export const createRoom = protectedProcedure
  .input(createRoomSchema)
  .mutation(async ({ ctx, input }) => {
    const questions = await getQuestions(ctx, {
      playlistId: input.playlistId,
    });
    if (questions.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const user = await clerkClient.users.getUser(ctx.auth.userId);

    const id = nanoid();
    roomManager.send({
      type: "CREATE_ROOM",
      id,
      context: {
        questions,
        host: {
          id: user.id,
          username: user.firstName || user.username || "",
          avatar: user.profileImageUrl,
        },
        players: [],
        currentQuestion: 0,
      },
    });

    return id;
  });