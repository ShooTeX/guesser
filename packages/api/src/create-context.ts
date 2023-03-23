import { getAuth } from "@clerk/fastify";
import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { migrate } from "drizzle-orm/planetscale-serverless/migrator";
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { DATABASE_URL } from "./environment";

export async function createContext({
  req,
  res: __,
}: CreateFastifyContextOptions) {
  const auth = getAuth(req);
  const conn = connect({ url: DATABASE_URL });
  const database = drizzle(conn);
  await migrate(database, { migrationsFolder: "../migrations" });
  return { database, auth };
}
export type Context = inferAsyncReturnType<typeof createContext>;
