import type { ZodiosOptions } from "@zodios/core";
import { Zodios } from "@zodios/core";
import { array, z } from "zod";

const response = <T extends z.ZodTypeAny>(schema: T) => {
  return z.object({
    data: z.array(schema),
  });
};

const withBroadcasterId = <T extends z.AnyZodObject>(
  schema: T,
  broadcaster_id: string
) => {
  return schema.extend({
    broadcaster_id: z.literal(broadcaster_id).default(broadcaster_id),
  });
};

const user = z.object({
  id: z.string(),
  broadcaster_type: z.enum(["affiliate", "partner", ""]),
});

const outcome = z.object({
  id: z.string(),
  title: z.string(),
  channel_points: z.number(),
});

const predictionStatus = z.enum(["ACTIVE", "CANCELED", "LOCKED", "RESOLVED"]);

const prediction = z.object({
  id: z.string(),
  broadcaster_id: z.string(),
  title: z.string(),
  status: predictionStatus,
  outcomes: z.array(outcome).min(2).max(10),
  prediction_window: z.number().finite().min(30).max(1800),
});

const createPredictionParameters = prediction
  .pick({ title: true, prediction_window: true, broadcaster_id: true })
  .extend({
    outcomes: array(outcome.pick({ title: true }))
      .min(2)
      .max(10),
  });

const endPredictionParameters = z.union([
  prediction.pick({ id: true, broadcaster_id: true, status: true }),
  prediction.pick({ id: true, broadcaster_id: true }).extend({
    status: z.literal(predictionStatus.enum.RESOLVED),
    winning_outcome_id: outcome.shape.id,
  }),
]);

type initTwitchProperties = {
  token: string;
  userId: string;
};

export function initTwitchClient({ userId, token }: initTwitchProperties) {
  const options: ZodiosOptions = {
    sendDefaults: true,
    axiosConfig: {
      timeout: 10_000,
      headers: {
        Authorization: `Bearer ${token}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID,
      },
    },
  };

  return new Zodios(
    "https://api.twitch.tv/helix",
    [
      {
        method: "get",
        path: `/users?id=${userId}`,
        alias: "getUser",
        response: response(user),
      },
      {
        method: "post",
        path: "/predictions",
        alias: "createPrediction",
        response: response(prediction),
        parameters: [
          {
            name: "input",
            type: "Body",
            schema: withBroadcasterId(createPredictionParameters, userId),
          },
        ],
      },
      {
        method: "patch",
        path: "/predictions",
        alias: "endPrediction",
        response: response(prediction),
        parameters: [
          {
            name: "input",
            type: "Body",
            schema: withBroadcasterId(endPredictionParameters, userId),
          },
        ],
      },
    ],
    options
  );
}

export type TwitchClient = ReturnType<typeof initTwitchClient>;
