/* eslint-disable @typescript-eslint/consistent-type-imports */
import { roomSchema } from "@guesser/schemas";
import {
  ActorRefFrom,
  assign,
  ContextFrom,
  createMachine,
  spawn,
} from "xstate";
import { stop } from "xstate/lib/actions";
import { z } from "zod";

const roomMachine = createMachine(
  {
    preserveActionOrder: true,
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
        | { type: "REMOVE_ROOM"; id: string },
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
        },
      },
    },
  },
  {
    actions: {
      createRoom: assign({
        rooms: (context, { id, context: roomContext }) => ({
          ...context.rooms,
          [id]: spawn(roomMachine.withContext(roomContext)),
        }),
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      stopRoom: stop((context, { id }) => context.rooms[id]!),
      removeRoom: assign({
        rooms: (context, { id }) => {
          const rooms = context.rooms;
          delete rooms[id];

          return rooms;
        },
      }),
    },
    guards: {
      roomExists: (context, { id }) => !!context.rooms[id],
    },
  }
);
