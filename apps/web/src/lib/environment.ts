import { parseEnv, z } from "znv";

console.log(process.env);

export const { NODE_ENV, VERCEL_URL, API_URL } = parseEnv(process.env, {
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  VERCEL_URL: z.string().url().default("localhost:3000"),
  API_URL: z.string().url().default("localhost:3001"),
});
