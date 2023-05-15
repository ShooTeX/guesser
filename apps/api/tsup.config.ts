import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  target: "node16",
  platform: "node",
  minify: true,
  clean: true,
  noExternal: ["@guesser/schemas", "nanoid", "@planetscale"],
});
