import { build } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async function () {
  await build({
    entryPoints: ["src/index.ts"],
    logLevel: "info",
    outdir: "dist",
    minify: true,
    bundle: true,
    platform: "node",
    format: "cjs",
    sourcemap: true,
    plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
    external: ["immer"],
  });
})();
