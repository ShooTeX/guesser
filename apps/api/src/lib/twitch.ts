import type { ZodiosOptions } from "@zodios/core";
import { Zodios } from "@zodios/core";
import { z } from "zod";

const responseSchema = <T extends z.ZodTypeAny>(schema: T) => {
  return z.object({
    data: z.array(schema),
  });
};

const userSchema = z.object({
  id: z.string(),
  broadcaster_type: z.union([
    z.literal("affiliate"),
    z.literal("partner"),
    z.literal(""),
  ]),
});

const predictionSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.union([
    z.literal("ACTIVE"),
    z.literal("CANCELED"),
    z.literal("LOCKED"),
    z.literal("RESOLVED"),
  ]),
  outcomes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      channel_points: z.number(),
    })
  ),
});

type initTwitchProperties = {
  token: string;
  userId: string;
};

export function initTwitchClient({ userId, token }: initTwitchProperties) {
  const options: ZodiosOptions = {
    axiosConfig: {
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
        response: responseSchema(userSchema),
      },
      {
        method: "post",
        path: "/predictions",
        alias: "createPrediction",
        response: responseSchema(predictionSchema),
        parameters: [
          {
            name: "input",
            type: "Body",
            schema: z.object({
              title: z.string(),
              outcomes: z
                .array(
                  z.object({
                    title: z.string(),
                  })
                )
                .min(2)
                .max(10),
              prediction_window: z.number().finite().min(30).max(1800),
            }),
          },
        ],
      },
    ],
    options
  );
}
