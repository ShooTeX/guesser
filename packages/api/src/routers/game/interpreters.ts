import { interpret } from "xstate";
import { roomManagerMachine } from "../../machines/room-manager";

export const roomManager = interpret(
  roomManagerMachine.withContext({ rooms: {} })
).start();
