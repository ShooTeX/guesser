import { observable } from "@trpc/server/observable";
import { exampleRouter } from "./routers/example";
import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  example: exampleRouter,
  randomNumber: publicProcedure.subscription(() => {
    return observable<{ randomNumber: number }>((emit) => {
      const timer = setInterval(() => {
        emit.next({ randomNumber: Math.random() });
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    });
  }),
});

export type AppRouter = typeof appRouter;
