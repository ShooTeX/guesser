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
    predictableActionArguments: true,
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
    on: {
      JOIN: {
        actions: "connectPlayer",
        cond: "playerExists",
      },
      DISCONNECT: {
        actions: "disconnectPlayer",
        cond: "playerExists",
      },
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
      connectPlayer: assign({
        players: ({ players }, event) => {
          const player = players.find(
            (player) => player.id === event.player.id
          );

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          player!.connected = true;

          return players;
        },
      }),
      disconnectPlayer: assign({
        players: ({ players }, event) => {
          const player = players.find((player) => player.id === event.id);

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          player!.connected = false;

          console.log(players);

          return players;
        },
      }),
      nextQuestion: assign({
        currentQuestion: (context) => context.currentQuestion + 1,
      }),
    },
    guards: {
      playerExists: ({ players }, event) =>
        players.some(
          (player) =>
            player.id === (event.type === "JOIN" ? event.player.id : event.id)
        ),
      hasNoMoreQuestions: (context) =>
        context.questions.length <= context.currentQuestion + 1,
    },
  }
);

export const roomManagerMachine = createMachine(
  {
    predictableActionArguments: true,
    id: "roomManager",
    tsTypes: {} as import("./room-manager.typegen").Typegen1,
    schema: {
      context: {} as {
        rooms: Map<string, ActorRefFrom<typeof roomMachine>>;
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
      stopRoom: stop(({ rooms }, { id }) => rooms.get(id)!),
      removeRoom: assign({
        rooms: (context, { id }) => {
          const rooms = context.rooms;
          rooms.delete(id);

          return rooms;
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      continueRoom: sendTo((context, event) => context.rooms.get(event.id)!, {
        type: "CONTINUE",
      }),
    },
    guards: {
      roomExists: ({ rooms }, { id }) => rooms.has(id),
    },
  }
);
