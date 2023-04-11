// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.room:invocation[0]": {
      type: "done.invoke.room:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
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
    resetGuesses: "CONTINUE" | "done.invoke.room:invocation[0]" | "xstate.stop";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {
    clientIsNotHost: "DISCONNECT" | "JOIN";
    hasNoMoreQuestions: "CONTINUE";
    playerDidNotGuess: "GUESS";
    playerExists: "DISCONNECT" | "JOIN";
  };
  eventsCausingServices: {};
  matchesStates:
    | "end"
    | "revealing_answer"
    | "showing_question"
    | "timeout"
    | "waiting";
  tags: never;
}
