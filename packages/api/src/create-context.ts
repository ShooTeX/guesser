import { getAuth } from "@clerk/fastify";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { database } from "./database";

export function createContext({ req, res: __ }: CreateFastifyContextOptions) {
  const auth = getAuth(req);
  return { database, auth };
}
export type Context = inferAsyncReturnType<typeof createContext>;
