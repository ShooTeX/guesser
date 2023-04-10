import { guessSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../../create-router";
import { roomManager } from "../interpreters";

export const guess = protectedProcedure
  .input(guessSchema)
  .mutation(({ ctx, input }) => {
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
  });
