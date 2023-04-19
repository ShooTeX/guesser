#!/usr/bin/env node

import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import ws from "@fastify/websocket";
import getPort from "get-port";
import { clerkPlugin } from "@clerk/fastify";
import cors from "@fastify/cors";
import type { AppRouter as AppRouterType } from "./routers/_app";
import { appRouter } from "./routers/_app";
import { createContext } from "./trpc/create-context";
import { enableMapSet } from "immer";
import type { StateValueFrom } from "xstate";
import type { roomMachine } from "./machines/room";
enableMapSet();

const server = fastify({
  maxParamLength: 5000,
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        destination: 1,
        colorize: true,
        ignore: "pid,hostname",
      },
    },
  },
});

void server.register(clerkPlugin);

void server.register(ws);

void server.register(cors, {
  origin: process.env.CLIENT_ORIGIN,
  allowedHeaders: ["Authorization", "content-type"],
});

void server.register(fastifyTRPCPlugin, {
  prefix: "/trpc",
  trpcOptions: { router: appRouter, createContext, onError: console.error },
  useWSS: true,
});

const start = async () => {
  try {
    await server.listen({
      host: "0.0.0.0",
      port: await getPort({
        port: [Number(process.env.PORT || 3000), 3001, 3002],
      }),
    });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => {
  void server.close();
});

void start();

export type AppRouter = AppRouterType;

export type RoomStateValues = StateValueFrom<typeof roomMachine>;
