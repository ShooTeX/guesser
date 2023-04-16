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
  broadcaster_type: z.union([
    z.literal("affiliate"),
    z.literal("partner"),
    z.literal(""),
  ]),
});

const outcome = z.object({
  id: z.string(),
  title: z.string(),
  channel_points: z.number(),
});

const prediction = z.object({
  id: z.string(),
  title: z.string(),
  status: z.union([
    z.literal("ACTIVE"),
    z.literal("CANCELED"),
    z.literal("LOCKED"),
    z.literal("RESOLVED"),
  ]),
  outcomes: z.array(outcome).min(2).max(10),
  prediction_window: z.number().finite().min(30).max(1800),
});

const createPredictionParameters = prediction
  .pick({ title: true, prediction_window: true })
  .extend({
    outcomes: array(outcome.pick({ title: true }))
      .min(2)
      .max(10),
  });

type initTwitchProperties = {
  token: string;
  userId: string;
};

export function initTwitchClient({ userId, token }: initTwitchProperties) {
  const options: ZodiosOptions = {
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
            schema: createPredictionParameters,
          },
        ],
      },
    ],
    options
  );
}

export type TwitchClient = ReturnType<typeof initTwitchClient>;
