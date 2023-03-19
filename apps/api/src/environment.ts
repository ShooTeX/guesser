import { parseEnv, port, z } from "znv";

export const { PORT, DATABASE_URL, CLIENT_ORIGIN } = parseEnv(process.env, {
  PORT: port().default(3000),
  DATABASE_URL: z.string(),
  CLIENT_ORIGIN: z.string(),
});
