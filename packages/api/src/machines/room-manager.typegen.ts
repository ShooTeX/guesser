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
    addPlayer: "JOIN";
    connectPlayer: "JOIN";
    disconnectPlayer: "DISCONNECT";
    distributePoints: "CONTINUE";
    nextQuestion: "CONTINUE";
    playerGuess: "GUESS";
    removePlayer: "DISCONNECT";
    resetGuesses: "CONTINUE";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    clientIsNotHost: "DISCONNECT" | "JOIN";
    hasNoMoreQuestions: "CONTINUE";
    playerDidNotGuess: "GUESS";
    playerExists: "DISCONNECT" | "JOIN";
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
    continueRoom: "CONTINUE_ROOM";
    createRoom: "CREATE_ROOM";
    guessInRoom: "GUESS_IN_ROOM";
    removeRoom: "REMOVE_ROOM";
    stopRoom: "REMOVE_ROOM";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    roomExists: "CONTINUE_ROOM" | "GUESS_IN_ROOM" | "REMOVE_ROOM";
  };
  eventsCausingServices: {};
  matchesStates: "running";
  tags: never;
}
