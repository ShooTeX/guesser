import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { DATABASE_URL } from "../environment";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const database = drizzle(pool);

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
  await migrate(database, { migrationsFolder: "./drizzle" });
})();
