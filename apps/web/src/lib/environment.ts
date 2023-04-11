import { parseEnv, z } from "znv";

export const { NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, NODE_ENV } = parseEnv(
  process.env,
  {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NODE_ENV: z.enum(["development", "test", "production"]),
  }
);
