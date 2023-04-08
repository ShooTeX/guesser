/* eslint-disable @typescript-eslint/consistent-type-imports */
import { playerSchema, roomSchema } from "@guesser/schemas";
import {
  ActorRefFrom,
  assign,
  ContextFrom,
  createMachine,
  spawn,
} from "xstate";
import { stop, sendTo } from "xstate/lib/actions";
import { z } from "zod";

export const roomMachine = createMachine(
  {
    preserveActionOrder: true,
    id: "room",
    tsTypes: {} as import("./room-manager.typegen").Typegen0,
    schema: {
      context: {} as z.infer<typeof roomSchema>,
      events: {} as
        | { type: "CONTINUE" }
        | { type: "JOIN"; player: z.infer<typeof playerSchema> }
        | { type: "DISCONNECT"; id: z.infer<typeof playerSchema>["id"] },
    },
    initial: "waiting",
    states: {
      waiting: {
        on: {
          CONTINUE: {
            target: "showing_question",
          },
          JOIN: {
            actions: "addPlayer",
          },
          DISCONNECT: {
            actions: "removePlayer",
          },
        },
      },
      showing_question: {
        on: {
          CONTINUE: {
            target: "revealing_answer",
          },
        },
      },
      revealing_answer: {
        on: {
          CONTINUE: [
            {
              target: "end",
              cond: "hasNoMoreQuestions",
            },
            {
              target: "showing_question",
              actions: "nextQuestion",
            },
          ],
        },
      },
      end: {},
    },
  },
  {
    actions: {
      addPlayer: assign({
        players: (context, { player }) => {
          if (player.id === context.host.id) return context.players;
          return [...context.players, player];
        },
      }),
      removePlayer: assign({
        players: (context, { id }) => {
          if (id === context.host.id) return context.players;
          return context.players.filter((player) => player.id !== id);
        },
      }),
      nextQuestion: assign({
        currentQuestion: (context) => context.currentQuestion + 1,
      }),
    },
    guards: {
      hasNoMoreQuestions: (context) =>
        context.questions.length === context.currentQuestion,
    },
  }
);

export const roomManagerMachine = createMachine(
  {
    id: "roomManager",
    tsTypes: {} as import("./room-manager.typegen").Typegen1,
    schema: {
      context: {} as {
        rooms: { [id: string]: ActorRefFrom<typeof roomMachine> };
      },
      events: {} as
        | {
            type: "CREATE_ROOM";
            id: string;
            context: ContextFrom<typeof roomMachine>;
          }
        | { type: "REMOVE_ROOM"; id: string }
        | { type: "CONTINUE_ROOM"; id: string },
    },
    initial: "running",
    states: {
      running: {
        on: {
          CREATE_ROOM: {
            actions: "createRoom",
          },
          REMOVE_ROOM: {
            actions: ["stopRoom", "removeRoom"],
            cond: "roomExists",
          },
          CONTINUE_ROOM: {
            actions: "continueRoom",
            cond: "roomExists",
          },
        },
      },
    },
  },
  {
    actions: {
      createRoom: assign({
        rooms: ({ rooms }, { id, context: roomContext }) => ({
          ...rooms,
          [id]: spawn(roomMachine.withContext(roomContext)),
        }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      stopRoom: stop(({ rooms }, { id }) => rooms[id]!),
      removeRoom: assign({
        rooms: (context, { id }) => {
          const rooms = context.rooms;
          delete rooms[id];

          return rooms;
        },
      }),
      continueRoom: ({ rooms }, { id }) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sendTo(rooms[id]!, { type: "CONTINUE" }),
    },
    guards: {
      roomExists: ({ rooms }, { id }) => !!rooms[id],
    },
  }
);
