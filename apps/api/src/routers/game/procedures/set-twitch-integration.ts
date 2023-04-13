import { setTwitchIntegrationSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../../../trpc/create-router";
import { roomManager } from "../interpreters";

export const setTwitchIntegration = protectedProcedure
  .input(setTwitchIntegrationSchema)
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

    roomManager.send({
      type: "SET_TWITCH_INTEGRATION_IN_ROOM",
      id: input.id,
      value: input.value,
    });

    const updatedSnapshot = roomManager
      .getSnapshot()
      .context.rooms.get(input.id)
      ?.getSnapshot();

    if (!updatedSnapshot) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Room was not found after updating",
      });
    }

    return { enabled: updatedSnapshot.context.integrations.twitch };
  });
