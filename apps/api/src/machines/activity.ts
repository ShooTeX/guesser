import { createMachine } from "xstate";
import { sendParent } from "xstate/lib/actions";

export const activityMachine = createMachine({
  id: "activityMachine",
  predictableActionArguments: true,
  initial: "running",
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  tsTypes: {} as import("./activity.typegen").Typegen0,
  states: {
    running: {
      after: {
        600_000: {
          target: "timeout",
        },
      },
      on: {
        ACTIVITY: {
          target: "running",
        },
      },
    },
    timeout: {
      entry: sendParent("TIMEOUT"),
      type: "final",
    },
  },
});
