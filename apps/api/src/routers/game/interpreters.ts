import { roomManagerMachine } from "@/machines/room-manager";
import { interpret } from "xstate";

export const roomManager = interpret(
  roomManagerMachine.withContext({ rooms: new Map() })
).start();
