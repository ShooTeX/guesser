import { getAuth } from "@clerk/fastify";
import { connect } from "@planetscale/database";
import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { DATABASE_URL } from "./environment";

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
  const conn = connect({ url: DATABASE_URL });
  const database = drizzle(conn);
  return createContextInner({ auth, database });
}
export type Context = inferAsyncReturnType<typeof createContext>;
