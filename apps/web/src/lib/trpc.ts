import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "api";
import { getCookie } from "typescript-cookie";

global.WebSocket = global.WebSocket || undefined;

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL)
    return `https://${process.env.NEXT_PUBLIC_API_URL}`;
  return `http://localhost:${process.env.PORT ?? 3001}`;
}

const batchLink = httpBatchLink({
  url: `${getBaseUrl()}/trpc`,
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
    url: `${getBaseUrl().replace("http", "ws")}/trpc`,
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
