import { assign } from "@xstate/immer";
import { createMachine } from "xstate";
import type { TwitchClient } from "../lib/twitch";

export const predictionsMachine = createMachine(
  {
    preserveActionOrder: true,
    predictableActionArguments: true,
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import("./predictions.typegen").Typegen0,
    schema: {
      events: {} as
        | {
            type: "CREATE_PREDICTION";
            input: Parameters<TwitchClient["createPrediction"]>;
          }
        | {
            type: "END_PREDICTION";
            input: Parameters<TwitchClient["endPrediction"]>;
          },
      context: {} as {
        client: TwitchClient;
        predictionId?: string;
      },
      services: {} as {
        createPrediction: {
          data: Awaited<ReturnType<TwitchClient["createPrediction"]>>["data"];
        };
      },
    },
    initial: "idle",
    states: {
      idle: {},
      loading: {
        invoke: {
          src: "createPrediction",
          onDone: {
            target: "created",
            actions: "setPredictionId",
          },
          onError: {
            target: "error",
          },
        },
      },
      created: {},
      error: {},
    },
    on: {
      CREATE_PREDICTION: {
        target: "loading",
      },
    },
  },
  {
    actions: {
      setPredictionId: assign((context, event) => {
        context.predictionId = event.data[0]?.id;
      }),
    },
    services: {
      createPrediction: async (context, event) => {
        const result = await context.client.createPrediction(...event.input);
        return result.data;
      },
    },
  }
);
