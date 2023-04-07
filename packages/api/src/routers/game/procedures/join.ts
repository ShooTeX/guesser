import { joinRoomSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { publicProcedure } from "../../../create-router";
import { roomManager } from "../interpreters";

export const join = publicProcedure
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
  });
