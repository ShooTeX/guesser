import { gameSchema as unsafeGameSchema } from "@guesser/schemas";
import { joinRoomSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import type { z } from "zod";
import { publicProcedure } from "../../../create-router";
import { roomManager } from "../interpreters";
import { zu } from "zod_utilz";
import type { StateValueFrom } from "xstate";
import type { roomMachine } from "../../../machines/room-manager";
import { clerkClient } from "@clerk/fastify";

const gameSchema = zu.useTypedParsers(unsafeGameSchema);

export const join = publicProcedure
  .input(joinRoomSchema)
  .subscription(async ({ ctx: _, input }) => {
    const room = roomManager.getSnapshot().context.rooms[input.id];

    if (!room) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const user = await clerkClient.users.getUser(input.userId);

    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    room.send({
      type: "JOIN",
      player: {
        id: user.id,
        avatar: user.profileImageUrl,
        score: 0,
        username: user.firstName || user.username || "",
        connected: true,
      },
    });

    return observable<
      z.infer<typeof gameSchema> & { state: StateValueFrom<typeof roomMachine> }
    >((emit) => {
      const subscription = room.subscribe(({ context, matches, value }) => {
        const { players, questions, currentQuestion, host } = context;
        console.log(players);
        const question = questions[currentQuestion];
        if (!question) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        const correctAnswer = question.answers.find(
          (answer) => answer.correct
        )?.id;

        if (!correctAnswer) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }

        const parsedResponse = gameSchema.parse({
          players,
          host,
          question,
          answers: question.answers,
          correctAnswer: matches("revealing_answer")
            ? correctAnswer
            : undefined,
        });

        emit.next({
          ...parsedResponse,
          state: value as StateValueFrom<typeof roomMachine>,
        });
      });
      return () => {
        room.send({
          type: "DISCONNECT",
          id: user.id,
        });

        subscription.unsubscribe();
      };
    });
  });
