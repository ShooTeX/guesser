import { continueRoomSchema } from "@guesser/schemas";
import { protectedProcedure } from "../../../create-router";
import { roomManager } from "../interpreters";

export const continueRoom = protectedProcedure
  .input(continueRoomSchema)
  .mutation(({ input }) => {
    console.log(input.id);
    roomManager.send({ type: "CONTINUE_ROOM", id: input.id });
  });
