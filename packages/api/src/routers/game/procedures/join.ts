import type { gameSchema } from "@guesser/schemas";
import { joinRoomSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import type { z } from "zod";
import { publicProcedure } from "../../../create-router";
import { roomManager } from "../interpreters";

export const join = publicProcedure
  .input(joinRoomSchema)
  .subscription(({ ctx: _, input }) => {
    const room = roomManager.getSnapshot().context.rooms[input.id];

    if (!room) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return observable<z.infer<typeof gameSchema>>((emit) => {
      const subscription = room.subscribe(({ context, matches }) => {
        const { players, questions, currentQuestion, host } = context;
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

        emit.next({
          players,
          host,
          question,
          answers: question.answers,
          correctAnswer: matches("revealing_answer")
            ? correctAnswer
            : undefined,
        });
      });
      return () => {
        subscription.unsubscribe();
      };
    });
  });
