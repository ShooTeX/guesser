import type { ZodiosOptions } from "@zodios/core";
import { Zodios } from "@zodios/core";
import { array, z } from "zod";

const response = <T extends z.ZodTypeAny>(schema: T) => {
  return z.object({
    data: z.array(schema),
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
  broadcaster_id: z.string().optional(),
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
            name: "prediction",
            type: "Body",
            schema: createPredictionParameters.transform((data) => ({
              ...data,
              broadcaster_id: data.broadcaster_id || userId,
            })),
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
            name: "prediction",
            type: "Body",
            schema: endPredictionParameters.transform((data) => ({
              ...data,
              broadcaster_id: data.broadcaster_id || userId,
            })),
          },
        ],
      },
    ],
    options
  );
}

export type TwitchClient = ReturnType<typeof initTwitchClient>;
