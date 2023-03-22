import { parseEnv, port, z } from "znv";

export const { PORT, CLIENT_ORIGIN } = parseEnv(process.env, {
  PORT: port().default(3000),
  CLIENT_ORIGIN: z.string(),
});
