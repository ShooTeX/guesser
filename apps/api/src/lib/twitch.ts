import got from "got";

type initTwitchProperties = {
  token: string;
  userId: string;
};

export function initTwitch({ userId, token }: initTwitchProperties) {
  const client = got.extend({
    prefixUrl: "https://api.twitch.tv/helix",
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID,
    },
    retry: {
      limit: 0,
    },
  });

  return {
    async createPrediction() {
      const result = await client.post("predictions", {
        json: {
          broadcaster_id: userId,
          title: "Does it work?",
          outcomes: [
            {
              title: "YES!",
            },
            {
              title: "YES!",
            },
          ],
          prediction_window: 30,
        },
      });
      return result;
    },
  };
}
