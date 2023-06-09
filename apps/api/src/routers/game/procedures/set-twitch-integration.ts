import { clerkClient } from "@clerk/fastify";
import { setTwitchIntegrationSchema } from "@guesser/schemas";
import { TRPCError } from "@trpc/server";
import { initTwitchClient } from "../../../lib/twitch";
import { protectedProcedure } from "../../../trpc/create-router";
import { roomManager } from "../interpreters";

export const setTwitchIntegration = protectedProcedure
  .input(setTwitchIntegrationSchema)
  .mutation(async ({ ctx, input }) => {
    const roomSnapshot = roomManager
      .getSnapshot()
      .context.rooms.get(input.id)
      ?.getSnapshot();

    if (!roomSnapshot) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Room was not found" });
    }

    if (ctx.auth.userId !== roomSnapshot.context.host.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User is not host",
      });
    }

    const twitchClient = async () => {
      if (!input.value) {
        return;
      }
      const user = await clerkClient.users.getUser(ctx.auth.userId);

      const twitchId = user.externalAccounts.find(
        (account) => account.provider === "oauth_twitch"
      )?.externalId;

      if (!twitchId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Twitch not authorized",
        });
      }

      const [twitchAuth] = await clerkClient.users.getUserOauthAccessToken(
        ctx.auth.userId,
        "oauth_twitch"
      );

      if (!twitchAuth) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Twitch not authorized",
        });
      }

      if (!twitchAuth.scopes?.includes("channel:manage:predictions")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Missing scope: channel:manage:predictions",
        });
      }

      const client = initTwitchClient({
        userId: twitchId,
        token: twitchAuth.token,
      });

      const twitchUser = await client.getUser();

      if (twitchUser.data[0]?.broadcaster_type === "") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Broadcaster is not affiliate or partner",
        });
      }

      return client;
    };

    roomManager.send({
      type: "SET_TWITCH_INTEGRATION_IN_ROOM",
      id: input.id,
      value: await twitchClient(),
    });

    const updatedSnapshot = roomManager
      .getSnapshot()
      .context.rooms.get(input.id)
      ?.getSnapshot();

    if (!updatedSnapshot) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Room was not found after updating",
      });
    }

    return { enabled: !!updatedSnapshot.context.twitch };
  });
