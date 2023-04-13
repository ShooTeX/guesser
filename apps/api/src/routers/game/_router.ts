import { router } from "../../trpc/create-router";
import { continueRoom } from "./procedures/continue-room";
import { createRoom } from "./procedures/create-room";
import { guess } from "./procedures/guess";
import { join } from "./procedures/join";
import { nextPlaylist } from "./procedures/next-playlist";
import { setTwitchIntegration } from "./procedures/set-twitch-integration";

export const gameRouter = router({
  join,
  createRoom,
  continueRoom,
  guess,
  nextPlaylist,
  setTwitchIntegration,
});
