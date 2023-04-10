// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "xstate.init": { type: "xstate.init" };
    "xstate.stop": { type: "xstate.stop" };
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
    nextPlaylist: "NEXT_PLAYLIST";
    nextQuestion: "CONTINUE";
    playerGuess: "GUESS";
    removePlayer: "DISCONNECT";
    resetGuesses: "CONTINUE" | "xstate.stop";
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
