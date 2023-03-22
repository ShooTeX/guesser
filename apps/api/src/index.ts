#!/usr/bin/env node

import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import ws from "@fastify/websocket";
import getPort from "get-port";
import { CLIENT_ORIGIN, PORT } from "./environment";
import { clerkPlugin } from "@clerk/fastify";
import cors from "@fastify/cors";
import { appRouter, createContext } from "@guesser/api";

const server = fastify({
  maxParamLength: 5000,
  logger: true,
});

void server.register(ws);

void server.register(clerkPlugin);

void server.register(cors, {
  origin: CLIENT_ORIGIN,
  allowedHeaders: ["Authorization", "content-type"],
});

void server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext },
  useWSS: true,
});

// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
  try {
    await server.listen({
      host: "0.0.0.0",
      port: await getPort({ port: [PORT, 3000, 3001, 3002] }),
    });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
})();
