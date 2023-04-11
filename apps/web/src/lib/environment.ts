import { parseEnv, z } from "znv";

export const { NODE_ENV, VERCEL_URL, API_URL } = parseEnv(process.env, {
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  VERCEL_URL: z.string().default("localhost:3000"),
  API_URL: z.string().default("localhost:3001"),
});
