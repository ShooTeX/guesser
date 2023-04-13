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
    async createPoll() {
      const result = await client.post("polls", {
        json: {
          broadcaster_id: userId,
          title: "Does it work?",
          choices: [
            {
              title: "YES!",
            },
            {
              title: "YES!",
            },
          ],
          duration: 15,
        },
      });
      return result;
    },
  };
}
