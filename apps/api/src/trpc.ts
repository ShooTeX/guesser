import type { inferAsyncReturnType } from "@trpc/server";
import { initTRPC } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { database } from "./database";

export function createContext({
  req: _,
  res: __,
}: CreateFastifyContextOptions) {
  return { database };
}
export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

export const {
  middleware,
  router,
  mergeRouters,
  procedure: publicProcedure,
} = t;
