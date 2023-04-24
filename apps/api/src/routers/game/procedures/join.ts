import { gameSchema as unsafeGameSchema } from "@guesser/schemas";
import { joinRoomSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import type { z } from "zod";
import { zu } from "zod_utilz";
import { clerkClient } from "@clerk/fastify";
import { roomManager } from "../interpreters";
import { publicProcedure } from "../../../trpc/create-router";
import type { RoomStateValue } from "../../../lib/map-state-values";
import { mapRoomStateValue } from "../../../lib/map-state-values";

const gameSchema = zu.useTypedParsers(unsafeGameSchema);

export const join = publicProcedure
  .input(joinRoomSchema)
  .subscription(async ({ ctx: _, input }) => {
    const room = roomManager.getSnapshot().context.rooms.get(input.id);
    const roomSnapshot = room?.getSnapshot();

    if (!room || !roomSnapshot) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    const user = await clerkClient.users.getUser(input.userId);

    if (
      !roomSnapshot.matches("game.waiting") &&
      roomSnapshot.context.host.id !== user.id &&
      !roomSnapshot.context.players.some((player) => player.id === user.id)
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    room.send({
      type: "JOIN",
      player: {
        id: user.id,
        avatar: user.profileImageUrl,
        score: 0,
        username: user.firstName ?? user.username ?? "",
        connected: true,
      },
    });

    return observable<z.infer<typeof gameSchema> & { state: RoomStateValue }>(
      (emit) => {
        const subscription = room.subscribe((state) => {
          const { players, questions, currentQuestion, host, playlistName } =
            state.context;
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
            correctAnswer: state.matches("game.revealing_answer")
              ? correctAnswer
              : undefined,
            ...(input.userId === host.id && {
              hostInfo: {
                currentQuestion,
                questionCount: questions.length,
                playlistName,
              },
            }),
          });

          emit.next({
            ...parsedResponse,
            state: mapRoomStateValue(state),
          });
        });
        return () => {
          room.send({
            type: "DISCONNECT",
            id: user.id,
          });

          subscription.unsubscribe();
        };
      }
    );
  });
