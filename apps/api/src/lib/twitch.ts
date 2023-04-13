import got from "got";

type initTwitchProperties = {
  token: string;
  userId: string;
};

export function initTwitch({ userId, token }: initTwitchProperties) {
  return {
    async createPoll() {
      const result = await got.post("https://api.twitch.tv/helix/polls", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
