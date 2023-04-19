import type { roomSchema, playerSchema, answerSchema } from "@guesser/schemas";
import { assign } from "@xstate/immer";
import { maxBy } from "remeda";
import { createMachine } from "xstate";
import { log, sendParent } from "xstate/lib/actions";
import type { z } from "zod";
import type { TwitchClient } from "../lib/twitch";

export const roomMachine = createMachine(
  {
    preserveActionOrder: true,
    predictableActionArguments: true,
    id: "room",
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    tsTypes: {} as import("./room.typegen").Typegen0,
    schema: {
      context: {} as z.infer<typeof roomSchema> & {
        twitch?: {
          client: TwitchClient;
          currentPrediction?: {
            id: string;
            outcomes: Awaited<
              ReturnType<TwitchClient["createPrediction"]>
            >["data"][0]["outcomes"];
          };
        };
      },
      events: {} as
        | { type: "CONTINUE" }
        | {
            type: "SET_TWITCH_INTEGRATION";
            value?: TwitchClient;
          }
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
      services: {} as {
        createPrediction: {
          data: Awaited<ReturnType<TwitchClient["createPrediction"]>>["data"];
        };
        resolvePrediction: {
          data: Awaited<ReturnType<TwitchClient["endPrediction"]>>["data"];
          error: string;
        };
        cancelPrediction: {
          data: Awaited<ReturnType<TwitchClient["endPrediction"]>>["data"];
        };
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
          GUESS: {
            actions: ["playerGuess"],
            cond: "playerDidNotGuess",
          },
        },
        initial: "init",
        states: {
          init: {
            always: [
              {
                cond: "isTwitchEnabled",
                target: "#room.showing_question.creating_prediction",
              },
              { target: "#room.showing_question.done" },
            ],
          },
          done: {
            on: {
              CONTINUE: [
                {
                  target: "#room.showing_question.resolving_prediction",
                  cond: "isTwitchEnabled",
                },
                {
                  target: "#room.revealing_answer",
                },
              ],
            },
          },
          creating_prediction: {
            invoke: {
              src: "createPrediction",
              onDone: {
                target: "#room.showing_question.done",
                actions: "assignPrediction",
              },
              onError: {
                target: "#room.showing_question.done",
                actions: log(),
              },
            },
          },
          resolving_prediction: {
            invoke: {
              src: "resolvePrediction",
              onError: {
                target: "#room.showing_question.canceling_prediction",
                actions: log(),
              },
              onDone: {
                target: "#room.revealing_answer",
                actions: ["setPredictionGuess", "resetCurrentPrediction"],
              },
            },
          },
          canceling_prediction: {
            exit: "resetCurrentPrediction",
            invoke: {
              src: "cancelPrediction",
              onDone: {
                target: "#room.revealing_answer",
              },
              onError: {
                target: "#room.revealing_answer",
                actions: log(),
              },
            },
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
      resetCurrentPrediction: assign((context) => {
        if (!context.twitch) return;
        context.twitch.currentPrediction = undefined;
      }),
      setPredictionGuess: assign((context, event) => {
        const currentQuestion = context.questions[context.currentQuestion];
        if (!currentQuestion) return;

        const [prediction] = event.data;
        if (!prediction) return;

        const player = context.players.find((player) => player.id === "TWITCH");
        if (!player) return;

        // INFO: select what should be selected as guess?

        // const outcomeWithMostPoints = maxBy(
        //   prediction.outcomes,
        //   (outcome) => outcome.channel_points
        // );

        const outcomeWithMostUsers = maxBy(
          prediction.outcomes,
          (outcome) => outcome.users
        );

        if (!outcomeWithMostUsers) return;

        const answerId =
          currentQuestion.answers[
            prediction.outcomes.findIndex(
              (outcome) => outcome.id === outcomeWithMostUsers?.id
            )
          ]?.id;

        if (!answerId) return;

        player.guess = answerId;
      }),
      assignPrediction: assign((context, event) => {
        if (!context.twitch || !event.data[0]) return;

        context.twitch.currentPrediction = {
          id: event.data[0].id,
          outcomes: event.data[0].outcomes,
        };
      }),
      setTwitchIntegration: assign((context, event) => {
        const player = context.players.find((player) => player.id === "TWITCH");
        if (event.value) {
          context.twitch = { client: event.value };
          if (!player) {
            context.players.push({
              connected: true,
              id: "TWITCH",
              username: "Chat",
              score: 0,
              avatar: "https://i.imgur.com/38fKR25.png",
            });
            return;
          }
          if (player) {
            player.connected = true;
            return;
          }
        }
        if (!event.value && player) {
          context.twitch = undefined;
          if (player) {
            player.connected = false;
          }
        }
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
    services: {
      createPrediction: async (context) => {
        const question = context.questions[context.currentQuestion];
        if (!question) {
          throw new Error("Question was not found");
        }
        const result = await context.twitch?.client.createPrediction({
          title: question.question,
          outcomes: question.answers.map((answer) => ({
            title: answer.answer,
          })),
          prediction_window: 30,
        });

        if (!result) {
          throw new Error("Could not create prediction");
        }
        return result.data;
      },
      resolvePrediction: async (context) => {
        if (!context.twitch) throw new Error("twitch not enabled");
        if (!context.twitch.currentPrediction)
          throw new Error("No running predictions");

        const correctAnswerIndex = context.questions[
          context.currentQuestion
        ]?.answers.findIndex((answer) => answer.correct);

        if (correctAnswerIndex === undefined || correctAnswerIndex === -1)
          throw new Error("Correct answer could not be found");

        const winning_outcome_id =
          context.twitch.currentPrediction.outcomes[correctAnswerIndex]?.id;

        if (!winning_outcome_id)
          throw new Error("Outcome id could not be found");

        const { data } = await context.twitch.client.endPrediction({
          id: context.twitch.currentPrediction.id,
          status: "RESOLVED",
          winning_outcome_id,
        });
        return data;
      },
      cancelPrediction: async (context) => {
        if (!context.twitch) throw new Error("twitch not enabled");
        if (!context.twitch.currentPrediction)
          throw new Error("No running predictions");

        const { data } = await context.twitch.client.endPrediction({
          id: context.twitch.currentPrediction.id,
          status: "CANCELED",
        });

        return data;
      },
    },
    guards: {
      isTwitchEnabled: ({ twitch }) => !!twitch,
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
