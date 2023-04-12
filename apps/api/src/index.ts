#!/usr/bin/env node

import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import type { FastifyPluginAsync } from "fastify";
import ws from "@fastify/websocket";
import { clerkPlugin } from "@clerk/fastify";
import cors from "@fastify/cors";
import type { AppRouter as AppRouterType } from "./routers/_app";
import { appRouter } from "./routers/_app";
import { createContext } from "./trpc/create-context";
import { enableMapSet } from "immer";
enableMapSet();

// const server = fastify({
//   maxParamLength: 5000,
//   logger: true,
// });

const app: FastifyPluginAsync = async (fastify) => {
  await fastify.register(clerkPlugin);

  await fastify.register(ws);

  await fastify.register(cors, {
    origin: process.env.CLIENT_ORIGIN,
    allowedHeaders: ["Authorization", "content-type"],
  });

  await fastify.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: { router: appRouter, createContext, onError: console.error },
    useWSS: true,
  });
};

export type AppRouter = AppRouterType;

export default app;
export { app };
