import { parseEnv, port, z } from "znv";

export const { PORT, DATABASE_URL } = parseEnv(process.env, {
  PORT: port().default(3000),
  DATABASE_URL: z.string(),
});
