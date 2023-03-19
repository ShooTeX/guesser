import type { inferAsyncReturnType } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export function createContext({ req, res }: CreateFastifyContextOptions) {
  return { req, res };
}
export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.create();

export const {
  middleware,
  router,
  mergeRouters,
  procedure: publicProcedure,
} = t;
