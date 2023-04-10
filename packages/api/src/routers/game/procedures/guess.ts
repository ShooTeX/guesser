import { guessSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../../create-router";
import { roomManager } from "../interpreters";

export const guess = protectedProcedure
  .input(guessSchema)
  .mutation(({ ctx, input }) => {
    // INFO: checks might be not needed, should state machine handle that?
    const room = roomManager
      .getSnapshot()
      .context.rooms.get(input.roomId)
      ?.getSnapshot();

    if (!room) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    if (!room.context.players.some((player) => player.id === ctx.auth.userId)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    roomManager.send({
      type: "GUESS_IN_ROOM",
      userId: ctx.auth.userId,
      answerId: input.id,
      roomId: input.roomId,
    });
  });
