import { continueRoomSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../../trpc/create-router";
import { roomManager } from "../interpreters";

export const continueRoom = protectedProcedure
  .input(continueRoomSchema)
  .mutation(({ ctx, input }) => {
    const roomSnapshot = roomManager
      .getSnapshot()
      .context.rooms.get(input.id)
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
    roomManager.send({ type: "CONTINUE_ROOM", id: input.id });
  });
