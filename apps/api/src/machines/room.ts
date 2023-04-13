import type { roomSchema, playerSchema, answerSchema } from "@guesser/schemas";
import { assign } from "@xstate/immer";
import { createMachine } from "xstate";
import { sendParent } from "xstate/lib/actions";
import type { z } from "zod";
import { activityMachine } from "./activity";

export const roomMachine = createMachine(
  {
    preserveActionOrder: true,
    predictableActionArguments: true,
    id: "room",
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import("./room.typegen").Typegen0,
    schema: {
      context: {} as z.infer<typeof roomSchema>,
      events: {} as
        | { type: "CONTINUE" }
        | { type: "SET_TWITCH_INTEGRATION"; value: boolean }
        | { type: "JOIN"; player: z.infer<typeof playerSchema> }
        | { type: "DISCONNECT"; id: z.infer<typeof playerSchema>["id"] }
        | {
            type: "GUESS";
            userId: z.infer<typeof playerSchema>["id"];
            answerId: z.infer<typeof answerSchema>["id"];
          }
        | {
            type: "NEXT_PLAYLIST";
            questions: z.infer<typeof roomSchema>["questions"];
            playlistName: z.infer<typeof roomSchema>["playlistName"];
          },
    },
    initial: "waiting",
    invoke: {
      src: activityMachine,
      autoForward: true,
      onDone: {
        target: "timeout",
      },
    },
    states: {
      waiting: {
        on: {
          CONTINUE: {
            target: "showing_question",
          },
          JOIN: {
            actions: ["addPlayer"],
            cond: "clientIsNotHost",
          },
          DISCONNECT: {
            actions: ["removePlayer"],
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
        exit: ["resetGuesses"],
        on: {
          CONTINUE: [
            {
              target: "end",
              cond: "hasNoMoreQuestions",
            },
            {
              target: "showing_question",
              actions: ["nextQuestion"],
            },
          ],
        },
      },
      end: {
        on: {
          NEXT_PLAYLIST: {
            target: "showing_question",
            actions: ["nextPlaylist"],
          },
        },
      },
      timeout: {
        entry: sendParent((context) => ({
          type: "REMOVE_ROOM",
          id: context.id,
        })),
        type: "final",
      },
    },
    on: {
      JOIN: {
        actions: ["connectPlayer"],
        cond: "playerExists",
      },
      DISCONNECT: {
        actions: ["disconnectPlayer"],
        cond: "playerExists",
      },
      SET_TWITCH_INTEGRATION: {
        actions: ["setTwitchIntegration"],
      },
    },
  },
  {
    actions: {
      setTwitchIntegration: assign((context, event) => {
        context.integrations.twitch = event.value;
      }),
      addPlayer: assign((context, event) => {
        context.players.push(event.player);
      }),
      removePlayer: assign((context, event) => {
        context.players = context.players.filter(
          (player) => player.id !== event.id
        );
      }),
      connectPlayer: assign(({ players }, event) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        players.find((player) => player.id === event.player.id)!.connected =
          true;
      }),
      disconnectPlayer: assign(({ players }, event) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        players.find((player) => player.id === event.id)!.connected = false;
      }),
      nextQuestion: assign((context) => {
        context.currentQuestion++;
      }),
      playerGuess: assign((context, event) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        context.players.find((player) => player.id === event.userId)!.guess =
          event.answerId;
      }),
      resetGuesses: assign((context) => {
        for (const player of context.players) {
          player.guess = undefined;
        }
      }),
      nextPlaylist: assign((context, event) => {
        context.currentQuestion = 0;
        context.questions = event.questions;
        context.playlistName = event.playlistName;
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
