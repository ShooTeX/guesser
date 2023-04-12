import { getAuth } from "@clerk/fastify";
import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { database } from "../lib/database";

export const createContextInner = ({
  database,
  auth,
}: {
  database: PlanetScaleDatabase;
  auth?: ReturnType<typeof getAuth> | undefined;
}) => {
  return { database, auth };
};

export function createContext({ req, res: _ }: CreateFastifyContextOptions) {
  const auth = req.headers.authorization ? getAuth(req) : undefined;
  return createContextInner({ auth, database });
}
export type Context = inferAsyncReturnType<typeof createContext>;
