import type { StateFrom } from "xstate";
import type { roomMachine } from "../machines/room";

export const mapRoomStateValue = ({
  matches,
}: StateFrom<typeof roomMachine>) => {
  if (matches("game.waiting")) return "waiting";
  if (matches("game.showing_question")) return "showing_question";
  if (matches("game.revealing_answer")) return "revealing_answer";
  if (matches("game.end")) return "end";

  return "unknown_state";
};

export type RoomStateValue = ReturnType<typeof mapRoomStateValue>;
