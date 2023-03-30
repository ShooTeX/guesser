import type { Config } from "drizzle-kit";
import { DATABASE_URL } from "./src/environment";

export default {
  out: "./migrations",
  schema: "./src/database/schemas/",
  connectionString: DATABASE_URL,
} satisfies Config;
