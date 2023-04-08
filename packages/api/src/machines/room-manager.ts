/* eslint-disable @typescript-eslint/consistent-type-imports */
import { playerSchema, roomSchema } from "@guesser/schemas";
import { ActorRefFrom, ContextFrom, createMachine, spawn } from "xstate";
import { assign } from "@xstate/immer";
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
      addPlayer: assign((context, event) => {
        if (event.player.id === context.host.id) return;

        context.players.push(event.player);
      }),
      removePlayer: assign((context, event) => {
        if (event.id === context.host.id) return;

        context.players = context.players.filter(
          (player) => player.id !== event.id
        );
      }),
      connectPlayer: assign(({ players }, event) => {
        players.find((player) => player.id === event.player.id)!.connected =
          true;
      }),
      disconnectPlayer: assign(({ players }, event) => {
        players.find((player) => player.id === event.id)!.connected = false;
      }),
      nextQuestion: assign((context) => {
        context.currentQuestion++;
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
      createRoom: assign((context, event) => {
        context.rooms.set(
          event.id,
          spawn(roomMachine.withContext(event.context))
        );
      }),
      stopRoom: stop(({ rooms }, { id }) => rooms.get(id)!),
      removeRoom: assign((context, event) => {
        context.rooms.delete(event.id);
      }),
      continueRoom: sendTo((context, event) => context.rooms.get(event.id)!, {
        type: "CONTINUE",
      }),
    },
    guards: {
      roomExists: ({ rooms }, { id }) => rooms.has(id),
    },
  }
);
