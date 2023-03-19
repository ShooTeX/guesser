import { getAuth } from "@clerk/fastify";
import type { inferAsyncReturnType } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { database } from "./database";

export function createContext({ req, res: __ }: CreateFastifyContextOptions) {
  const auth = getAuth(req);
  return { database, auth };
}
export type Context = inferAsyncReturnType<typeof createContext>;

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
