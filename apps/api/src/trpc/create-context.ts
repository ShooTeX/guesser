import { getAuth } from "@clerk/fastify";
import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { database } from "../lib/database";
import type { FastifyBaseLogger } from "fastify";

export const createContextInner = ({
  database,
  auth,
  logger,
}: {
  database: PlanetScaleDatabase;
  logger: FastifyBaseLogger;
  auth?: ReturnType<typeof getAuth> | undefined;
}) => {
  return { database, auth, logger };
};

export function createContext({ req, res: _ }: CreateFastifyContextOptions) {
  const auth = req.headers.authorization ? getAuth(req) : undefined;
  const logger = req.log;
  return createContextInner({ auth, database, logger });
}
export type Context = inferAsyncReturnType<typeof createContext>;
