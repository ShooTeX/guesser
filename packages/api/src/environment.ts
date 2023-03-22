import { parseEnv, z } from "znv";

export const { DATABASE_URL } = parseEnv(process.env, {
  DATABASE_URL: z.string(),
});
