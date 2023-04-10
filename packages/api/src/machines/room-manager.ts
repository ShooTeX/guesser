/* eslint-disable @typescript-eslint/consistent-type-imports */
import { answerSchema, playerSchema, roomSchema } from "@guesser/schemas";
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
        | { type: "DISCONNECT"; id: z.infer<typeof playerSchema>["id"] }
        | {
            type: "GUESS";
            userId: z.infer<typeof playerSchema>["id"];
            answerId: z.infer<typeof answerSchema>["id"];
          },
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
            cond: "clientIsNotHost",
          },
          DISCONNECT: {
            actions: "removePlayer",
            cond: "clientIsNotHost",
          },
        },
      },
      showing_question: {
        on: {
          CONTINUE: {
            target: "revealing_answer",
          },
          GUESS: {
            actions: ["playerGuess"],
            cond: "playerDidNotGuess",
          },
        },
      },
      revealing_answer: {
        entry: ["distributePoints"],
        on: {
          CONTINUE: [
            {
              target: "end",
              cond: "hasNoMoreQuestions",
            },
            {
              target: "showing_question",
              actions: ["resetGuesses", "nextQuestion"],
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
        context.players.push(event.player);
      }),
      removePlayer: assign((context, event) => {
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
      playerGuess: assign((context, event) => {
        context.players.find((player) => player.id === event.userId)!.guess =
          event.answerId;
      }),
      resetGuesses: assign((context) => {
        for (const player of context.players) {
          player.guess = undefined;
        }
      }),
      distributePoints: assign((context) => {
        for (const player of context.players) {
          if (
            player.guess ===
            context.questions[context.currentQuestion]?.answers.find(
              (answer) => answer.correct
            )?.id
          ) {
            player.score = player.score + 5;
          }
        }
      }),
    },
    guards: {
      clientIsNotHost: ({ host }, event) =>
        host.id !== (event.type === "JOIN" ? event.player.id : event.id),
      playerExists: ({ players }, event) =>
        players.some(
          (player) =>
            player.id === (event.type === "JOIN" ? event.player.id : event.id)
        ),
      hasNoMoreQuestions: (context) =>
        context.questions.length <= context.currentQuestion + 1,
      playerDidNotGuess: (context, event) =>
        !context.players.find((player) => player.id === event.userId)?.guess,
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
        | { type: "CONTINUE_ROOM"; id: string }
        | {
            type: "GUESS_IN_ROOM";
            userId: z.infer<typeof playerSchema>["id"];
            answerId: z.infer<typeof answerSchema>["id"];
            roomId: string;
          },
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
          GUESS_IN_ROOM: {
            actions: "guessInRoom",
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
      guessInRoom: sendTo(
        (context, event) => context.rooms.get(event.roomId)!,
        (_, event) => ({
          type: "GUESS",
          answerId: event.answerId,
          userId: event.userId,
        })
      ),
    },
    guards: {
      roomExists: ({ rooms }, event) =>
        rooms.has(event.type === "GUESS_IN_ROOM" ? event.roomId : event.id),
    },
  }
);
