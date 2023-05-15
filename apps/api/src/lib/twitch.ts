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
  title: z
    .string()
    .trim()
    .max(25)
    // eslint-disable-next-line unicorn/prefer-top-level-await
    .catch(({ input }) => input.slice(0, 25)),
  channel_points: z.number(),
  users: z.number(),
});

const predictionStatus = z.enum(["ACTIVE", "CANCELED", "LOCKED", "RESOLVED"]);

const prediction = z.object({
  id: z.string(),
  broadcaster_id: z.string().optional(),
  title: z
    .string()
    .trim()
    .max(45)
    // eslint-disable-next-line unicorn/prefer-top-level-await
    .catch(({ input }) => input.slice(0, 45)),
  status: predictionStatus,
  outcomes: z.array(outcome).min(2).max(10),
  prediction_window: z.number().finite().min(30).max(1800),
  winning_outcome_id: z.string().nullish(),
});

const createPredictionParameters = prediction
  .pick({ title: true, prediction_window: true, broadcaster_id: true })
  .extend({
    outcomes: array(outcome.pick({ title: true }))
      .min(2)
      .max(10),
  });

const endPredictionParameters = z.union([
  prediction
    .pick({
      id: true,
      broadcaster_id: true,
    })
    .extend({
      status: predictionStatus.exclude(["RESOLVED"]),
    }),
  prediction.pick({ id: true, broadcaster_id: true }).extend({
    status: predictionStatus.extract(["RESOLVED"]),
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
