import type { AppRouter } from "@guesser/api";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { getCookie } from "typescript-cookie";
import { API_URL } from "./environment";

function getBaseUrl() {
  return API_URL;
}

global.WebSocket = global.WebSocket || undefined;

const batchLink = httpBatchLink({
  url: `http://${getBaseUrl()}/trpc`,
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

  const wsClient = createWSClient({ url: `ws://${getBaseUrl()}/trpc` });
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
