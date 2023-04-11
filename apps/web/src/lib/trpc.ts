import type { AppRouter } from "@guesser/api";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { getCookie } from "typescript-cookie";

global.WebSocket = global.WebSocket || undefined;

const batchLink = httpBatchLink({
  url: process.env.NEXT_PUBLIC_API_URL
    ? `https://${process.env.NEXT_PUBLIC_API_URL}/trpc`
    : "http://localhost:3001/trpc",
  headers() {
    return {
      Authorization: getCookie("__session"),
    };
  },
});

const getLinks = () => {
  if (typeof window === "undefined") {
    return batchLink;
  }

  const wsClient = createWSClient({
    url: `ws://${process.env.NEXT_PUBLIC_API_URL || "localhost:3001"}/trpc`,
  });
  return wsLink<AppRouter>({ client: wsClient });
};

export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        splitLink({
          condition: (op) => op.type === "subscription",
          true: getLinks(),
          false: batchLink,
        }),
      ],
    };
  },
  ssr: false,
});

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
