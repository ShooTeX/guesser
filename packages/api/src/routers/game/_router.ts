import { observable } from "@trpc/server/observable";
import type { ContextFrom } from "xstate";
import { interpret } from "xstate";
import { publicProcedure, router } from "../../create-router";
import { roomMachine } from "../../machines/room-manager";

const actor = interpret(
  roomMachine.withContext({ currentQuestion: 0, players: [], questions: [] })
).start();

export const gameRouter = router({
  join: publicProcedure.subscription(() => {
    return observable<ContextFrom<typeof roomMachine>>((emit) => {
      actor.subscribe((data) => {
        console.log("data");
        emit.next({ ...data.context, state: data.value });
      });
      return () => {
        // actor.stop();
      };
    });
  }),
  continue: publicProcedure.mutation(() => {
    actor.send({ type: "CONTINUE" });
  }),
});
