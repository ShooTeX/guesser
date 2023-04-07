import { clerkClient } from "@clerk/fastify";
import { createRoomSchema, joinRoomSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { nanoid } from "nanoid";
import { interpret } from "xstate";
import {
  protectedProcedure,
  publicProcedure,
  router,
} from "../../create-router";
import { roomManagerMachine } from "../../machines/room-manager";
import { getQuestions } from "../questions/models";

const roomManager = interpret(
  roomManagerMachine.withContext({ rooms: {} })
).start();

roomManager.subscribe((data) => console.log(data.context));

export const gameRouter = router({
  join: publicProcedure
    .input(joinRoomSchema)
    .subscription(({ ctx: _, input }) => {
      const room = roomManager.getSnapshot().context.rooms[input.id];

      if (!room) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return observable<unknown>((emit) => {
        const subscription = room.subscribe((data) => {
          emit.next(data);
        });
        return () => {
          subscription.unsubscribe();
        };
      });
    }),

  createRoom: protectedProcedure
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
          players: [
            {
              id: ctx.auth.userId,
              username: user.firstName || "",
              isHost: true,
              connected: false,
              score: 0,
            },
          ],
          currentQuestion: 0,
        },
      });

      return id;
    }),
});
