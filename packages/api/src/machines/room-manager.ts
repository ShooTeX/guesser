/* eslint-disable @typescript-eslint/consistent-type-imports */
import { roomSchema } from "@guesser/schemas";
import { createMachine } from "xstate";
import { z } from "zod";

export const roomMachine = createMachine(
  {
    id: "room",
    tsTypes: {} as import("./room-manager.typegen").Typegen0,
    schema: {
      context: {} as z.infer<typeof roomSchema>,
    },
    initial: "waiting",
    states: {
      waiting: {
        on: {
          CONTINUE: {
            target: "showing_question",
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
      nextQuestion: (context) => {
        context.currentQuestion = context.currentQuestion + 1;
      },
    },
    guards: {
      hasNoMoreQuestions: (context) =>
        context.questions.length === context.currentQuestion,
    },
  }
);

export const roomManagerMachine = createMachine({
  id: "roomManager",
  tsTypes: {} as import("./room-manager.typegen").Typegen1,
  schema: {
    context: {} as { rooms: { value: string } },
  },
  initial: "running",
  states: {
    running: {
      on: {
        ADD_ROOM: {
          actions: "addRoom",
        },
        REMOVE_ROOM: {
          actions: "removeRoom",
        },
      },
    },
  },
});
