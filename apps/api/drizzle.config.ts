import type { Config } from "drizzle-kit";

export default {
  out: "./migrations",
  schema: "./src/database/schemas/",
  connectionString: process.env.DATABASE_URL,
} satisfies Config;
