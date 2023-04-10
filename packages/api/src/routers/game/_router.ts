import { router } from "../../create-router";
import { continueRoom } from "./procedures/continue-room";
import { createRoom } from "./procedures/create-room";
import { guess } from "./procedures/guess";
import { join } from "./procedures/join";

export const gameRouter = router({
  join,
  createRoom,
  continueRoom,
  guess,
});
