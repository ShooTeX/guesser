import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./create-context";

const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

export const {
  middleware,
  router,
  mergeRouters,
  procedure: publicProcedure,
} = t;
