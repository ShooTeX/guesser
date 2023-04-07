// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    nextQuestion: "CONTINUE";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    hasNoMoreQuestions: "CONTINUE";
  };
  eventsCausingServices: {};
  matchesStates: "end" | "revealing_answer" | "showing_question" | "waiting";
  tags: never;
}

export interface Typegen1 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    createRoom: "CREATE_ROOM";
    removeRoom: "REMOVE_ROOM";
    stopRoom: "REMOVE_ROOM";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    roomExists: "REMOVE_ROOM";
  };
  eventsCausingServices: {};
  matchesStates: "running";
  tags: never;
}
