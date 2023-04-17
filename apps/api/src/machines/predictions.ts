import { createMachine } from "xstate";
import type { TwitchClient } from "../lib/twitch";

export const predictionsMachine = createMachine(
  {
    preserveActionOrder: true,
    predictableActionArguments: true,
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import("./predictions.typegen").Typegen0,
    schema: {
      events: {} as {
        type: "CREATE_PREDICTION";
        input: Parameters<TwitchClient["createPrediction"]>[0];
      },
      context: {} as {
        client: TwitchClient;
        predictionId?: string;
      },
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          CREATE_PREDICTION: {
            target: "loading",
          },
        },
      },
      loading: {
        invoke: {
          src: "createPrediction",
        },
      },
    },
  },
  {
    services: {
      createPrediction: async (context, event) => {
        await context.client.createPrediction(event.input);
      },
    },
  }
);
