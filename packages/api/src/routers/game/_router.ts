import { router } from "../../create-router";
import { createRoom } from "./procedures/create-room";
import { join } from "./procedures/join";

export const gameRouter = router({
  join,
  createRoom,
});
