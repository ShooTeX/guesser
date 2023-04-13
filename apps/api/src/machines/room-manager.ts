import type { answerSchema, playerSchema, roomSchema } from "@guesser/schemas";
import type { ActorRefFrom, ContextFrom } from "xstate";
import { createMachine, spawn } from "xstate";
import { assign } from "@xstate/immer";
import { stop, sendTo } from "xstate/lib/actions";
import type { z } from "zod";
import { roomMachine } from "./room";

export const roomManagerMachine = createMachine(
  {
    predictableActionArguments: true,
    id: "roomManager",
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import("./room-manager.typegen").Typegen0,
    schema: {
      context: {} as {
        rooms: Map<string, ActorRefFrom<typeof roomMachine>>;
      },
      events: {} as
        | {
            type: "CREATE_ROOM";
            id: string;
            context: Omit<ContextFrom<typeof roomMachine>, "id">;
          }
        | { type: "REMOVE_ROOM"; id: string }
        | { type: "CONTINUE_ROOM"; id: string }
        | {
            type: "GUESS_IN_ROOM";
            userId: z.infer<typeof playerSchema>["id"];
            answerId: z.infer<typeof answerSchema>["id"];
            roomId: string;
          }
        | {
            type: "NEXT_PLAYLIST_IN_ROOM";
            roomId: string;
            questions: z.infer<typeof roomSchema>["questions"];
            playlistName: z.infer<typeof roomSchema>["playlistName"];
          }
        | {
            type: "SET_TWITCH_INTEGRATION_IN_ROOM";
            id: string;
            value: boolean;
          },
    },
    initial: "running",
    states: {
      running: {
        on: {
          CREATE_ROOM: {
            actions: ["createRoom"],
          },
          REMOVE_ROOM: {
            actions: ["stopRoom", "removeRoom"],
            cond: "roomExists",
          },
          CONTINUE_ROOM: {
            actions: "continueRoom",
            cond: "roomExists",
          },
          GUESS_IN_ROOM: {
            actions: "guessInRoom",
            cond: "roomExists",
          },
          NEXT_PLAYLIST_IN_ROOM: {
            actions: "nextPlaylistInRoom",
            cond: "roomExists",
          },
          SET_TWITCH_INTEGRATION_IN_ROOM: {
            actions: "setTwitchIntegrationInRoom",
            cond: "roomExists",
          },
        },
      },
    },
  },
  {
    actions: {
      createRoom: assign((context, event) => {
        context.rooms.set(
          event.id,
          spawn(
            roomMachine.withContext({ ...event.context, id: event.id }),
            event.id
          )
        );
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      stopRoom: stop(({ rooms }, { id }) => rooms.get(id)!),
      removeRoom: assign((context, event) => {
        context.rooms.delete(event.id);
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      continueRoom: sendTo((context, event) => context.rooms.get(event.id)!, {
        type: "CONTINUE",
      }),
      guessInRoom: sendTo(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (context, event) => context.rooms.get(event.roomId)!,
        (_, event) => ({
          type: "GUESS",
          answerId: event.answerId,
          userId: event.userId,
        })
      ),
      nextPlaylistInRoom: sendTo(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (context, event) => context.rooms.get(event.roomId)!,
        (_, event) => ({
          type: "NEXT_PLAYLIST",
          questions: event.questions,
          playlistName: event.playlistName,
        })
      ),
      setTwitchIntegrationInRoom: sendTo(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (context, event) => context.rooms.get(event.id)!,
        (_, event) => ({
          type: "SET_TWITCH_INTEGRATION",
          value: event.value,
        })
      ),
    },
    guards: {
      roomExists: ({ rooms }, event) =>
        rooms.has(
          event.type === "GUESS_IN_ROOM" ||
            event.type === "NEXT_PLAYLIST_IN_ROOM"
            ? event.roomId
            : event.id
        ),
    },
  }
);
